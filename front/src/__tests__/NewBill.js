/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { screen, waitFor } from "@testing-library/dom"
import mockStore from "../__mocks__/store"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {
      
      //? Fonction pour initialiser un nouveau module "NewBill"
      function initialisationNewBill() {
        //? Génère le contenu HTML pour le module NewBill
        const html = NewBillUI();
        
        //? Injecte le contenu HTML dans le corps de la page
        document.body.innerHTML = html;

        //? Crée une fonction de navigation fictive pour les tests (Jest)
        const onNavigate = jest.fn(() => {});

        //? Crée un magasin fictif pour les tests (utilisé avec Redux)
        const store = mockStore;

        //? Définit un objet utilisateur fictif
        const userObj = {
            type: "Employee",
            email: "employee@test.tld",
            password: "employee",
            status: "connected"
        };

        //? Remplace la fonctionnalité locale de stockage par un faux stockage (utilisé pour les tests)
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        //? Stocke l'objet utilisateur fictif dans le stockage local (simulant la connexion)
        window.localStorage.setItem('user', JSON.stringify(userObj));

        //? Instancie et retourne un nouvel objet "NewBill" avec les paramètres appropriés
        return new NewBill({ document, onNavigate, store, locaStore: window.localStorage });
      }

      let newbills;
      //? Avant chaque test, initialise un nouvel objet "NewBill" fictif
      beforeEach(() => {
        newbills = initialisationNewBill();
      });

      // ***************************************************************************
      // *** TEST FONCTIONNELS && TEST UNITAIRES ***
      // ***************************************************************************
      
      //! Test : Le fichier a l'extension png, jpeg ou jpg
      test("Then the file is of extension png or jpeg or jpg", () => {
        //? Obtient l'élément d'entrée de fichier en utilisant un attribut de test
        const fileInput = screen.getByTestId('file');

        //? Crée un objet de fichier avec une extension jpg
        const file = new File(['file'], 'test.jpg', { type: 'image/jpg' });

        //? Crée un événement de changement
        const event = new Event('change', { bubbles: true });

        //? Définit la propriété 'files' de l'élément d'entrée de fichier avec le fichier créé
        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });

        //? Déclenche l'événement de changement sur l'élément d'entrée de fichier
        fileInput.dispatchEvent(event);

        //? S'attend à ce que la méthode handleChangeFile renvoie undefined (fichier valide)
        expect(newbills.handleChangeFile(event)).toBe(undefined);
      });

      //! Test : Le fichier n'accepte pas d'extension autre que png, jpeg ou jpg
      test("Then the file don't accept other extension than png or jpeg or jpg", () => {
        //? Obtient l'élément d'entrée de fichier en utilisant un attribut de test
        const fileInput = screen.getByTestId('file');

        //? Crée un objet de fichier avec une extension pdf (non autorisée)
        const file = new File(['file'], 'test.pdf', { type: 'application/pdf' });

        //? Crée un événement de changement
        const event = new Event('change', { bubbles: true });

        //? Définit la propriété 'files' de l'élément d'entrée de fichier avec le fichier créé
        Object.defineProperty(fileInput, 'files', {
            value: [file]
        });

        //? Déclenche l'événement de changement sur l'élément d'entrée de fichier
        fileInput.dispatchEvent(event);

        //? S'attend à ce que la méthode handleChangeFile renvoie false (fichier non valide)
        expect(newbills.handleChangeFile(event)).toBe(false);
      });
    })

      // ***************************************************************************
      // *** TEST INTÉGRATION ***
      // ***************************************************************************

      // ! Test d'intégration -> POST Ajouter Erreur 500
      test("POST bill", async () => {
        //? Crée un élément div "root" et l'ajoute au corps du document
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);

        //? Active le routage dans l'application
        router();

        //? Déclenche la navigation vers la page de création de facture
        window.onNavigate(ROUTES_PATH.NewBill);

        //? Attend jusqu'à ce que le texte "Envoyer" soit affiché (indiquant que la page est chargée)
        await waitFor(() => screen.getAllByText("Envoyer"));
      });

      //? Description : En cas d'erreur sur l'API
      describe("When an error occurs on API", () => {
        //? Test : L'envoi de la facture échoue avec un message d'erreur 500
        test("POST bill fails with 500 message error", async () => {
            try {
                //? Espionne la méthode "bills" du magasin fictif
                jest.spyOn(mockStore, "bills");

                //? Déclenche la navigation vers la page de création de facture
                window.onNavigate(ROUTES_PATH.NewBill);

                //? Crée un élément div "root" et l'ajoute au corps du document
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.appendChild(root);

                //? Active le routage dans l'application
                router();

                //? Sélectionne le bouton d'envoi de la facture
                const buttonSubmit = screen.getAllByText('Envoyer');
                buttonSubmit[0].click();

                //? Simule un échec de l'API en rejetant une promesse avec une erreur
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        create: (bill) => {
                            return Promise.reject(new Error("Erreur 500"));
                        }
                    };
                });

                //? Redirige vers la page de création de facture
                window.onNavigate(ROUTES_PATH.NewBill);

                //? Attend une prochaine itération de la boucle d'événement
                await new Promise(process.nextTick);

                //? Vérifie la présence du message d'erreur "Erreur 500"
                const message = screen.queryByText(/Erreur 500/);
                await waitFor(() => {
                    expect(message).toBeTruthy();
                });
            } catch (error) {
                console.error(error);
            }
        });
        test("POST bill fails with 404 message error", async () => {
          try {
              //? Espionne la méthode "bills" du magasin fictif
              jest.spyOn(mockStore, "bills");

              //? Déclenche la navigation vers la page de création de facture
              window.onNavigate(ROUTES_PATH.NewBill);

              //? Crée un élément div "root" et l'ajoute au corps du document
              const root = document.createElement("div");
              root.setAttribute("id", "root");
              document.body.appendChild(root);

              //? Active le routage dans l'application
              router();

              //? Sélectionne le bouton d'envoi de la facture
              const buttonSubmit = screen.getAllByText('Envoyer');
              buttonSubmit[0].click();

              //? Simule un échec de l'API en rejetant une promesse avec une erreur
              mockStore.bills.mockImplementationOnce(() => {
                  return {
                      create: (bill) => {
                          return Promise.reject(new Error("Erreur 404"));
                      }
                  };
              });

              //? Redirige vers la page de création de facture
              window.onNavigate(ROUTES_PATH.NewBill);

              //? Attend une prochaine itération de la boucle d'événement
              await new Promise(process.nextTick);

              //? Vérifie la présence du message d'erreur "Erreur 404"
              const message = screen.queryByText(/Erreur 404/);
              await waitFor(() => {
                  expect(message).toBeTruthy();
              });
          } catch (error) {
              console.error(error);
          }
        });
    });
  })
})