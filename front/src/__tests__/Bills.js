/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";


jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    function initialisationBills(){ 
      document.body.innerHTML = BillsUI({ data: bills })
  
      const onNavigate = jest.fn(()=>{})
  
      const store = mockStore

      const userObj = {
        type:"Employee",
        email:"employee@test.tld",
        password:"employee",
        status:"connected"
      }
  
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify(userObj))
  
      return new Bills({document, onNavigate, store, localStorage })
    }
    
    describe("When I am on Bills Page", () => {
      let theBills
      beforeEach(() =>{
        theBills = initialisationBills()
      })

      //? TEST UNITAIRE ET INTÉGRATION + BUG : 

      // ! TEST : Ensuite, l'icône de facturation dans la disposition verticale devrait être mise en évidence :
      test("Then bill icon in vertical layout should be highlighted", async () => {
        //? Remplace la fonction native `localStorage` par `localStorageMock`.
        //? Cela permet de simuler le stockage local pour les tests.
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })

        //? Ajoute un élément 'user' simulé au stockage local avec une valeur JSON.
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        //? Crée un élément "div" avec l'ID "root" et l'ajoute au corps du document.
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)

        //? Appelle la fonction `router()` pour simuler la navigation.
        router()

        //? Déclenche l'événement `onNavigate` avec le chemin `ROUTES_PATH.Bills`
        //? pour simuler la navigation vers la page des factures (bills).
        window.onNavigate(ROUTES_PATH.Bills)

        //? Récupère l'icône de fenêtre en utilisant un attribut de test (test ID).
        const windowIcon = screen.getByTestId('icon-window')

        //? Vérifie que la classe `active-icon` est présente dans la liste des classes de l'icône de fenêtre.
        //? Ceci est un test pour s'assurer que l'icône est active.
        expect(windowIcon.classList.contains('active-icon')).toBe(true);
      })


      // ! TEST : Ensuite, les factures devraient être classées de la plus ancienne à la plus récente :
      test("Then bills should be ordered from earliest to latest", () => {
        //? Définition du contenu du corps du document avec les données des factures
        document.body.innerHTML = BillsUI({ data: bills }); 
        //? Récupération de toutes les dates correspondantes au format spécifié et extraction du contenu HTML
        const dates = screen
          .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML); 
        //? Fonction de tri anti-chronologique (du plus récent au plus ancien)
        const antiChrono = (a, b) => ((a < b) ? 1 : -1); 
        //? Tri des dates extraites
        const datesSorted = [...dates].sort(antiChrono); 
        //? Vérification que les dates extraites sont triées de manière identique à la liste triée
        expect(dates).toEqual(datesSorted); 
      }); 


      // ! TEST : Ensuite, je peux ouvrir une fenêtre modale en cliquant sur l'icône de l'œil :
      test("Then I can open a modal by clicking on the eye icon", async () => {
        //? Remplacez la fonction native `localStorage` par `localStorageMock`.
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      
        //? Ajoutez un élément 'user' simulé au stockage local avec une valeur JSON.
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
      
        //? Créez un élément "div" avec l'ID "root" et ajoutez-le au corps du document.
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
      
        //? Appelez la fonction `router()` pour simuler la navigation.
        router();
      
        //? Déclenchez l'événement `onNavigate` avec le chemin `ROUTES_PATH.Bills`
        //? pour simuler la navigation vers la page des factures (bills).
        window.onNavigate(ROUTES_PATH.Bills);
      
        //? Ajoutez une donnée de facture dans le tableau des factures pour le test.
        const testData = bills[0];
        document.body.innerHTML = BillsUI({ data: [testData] });
      
        //? Récupérez l'icône "eye" en utilisant un attribut de test (test ID).
        const eyeIcon = screen.getByTestId('icon-eye');
      
        //? Simulez le clic sur l'icône "eye".
        fireEvent.click(eyeIcon);
      });


      // ! TEST : Ensuite, en cliquant sur le bouton 'Nouvelle note de frais', je devrais être redirigé vers le formulaire Nouvelle Note de frais :
      test("Then clicking on the 'Nouvelle note de frais' button should redirect to NewBill form", () => {
        //? Remplacez la fonction native `localStorage` par `localStorageMock`.
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        //? Ajoutez un élément 'user' simulé au stockage local avec une valeur JSON.
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }));

        //? Créez un élément "div" avec l'ID "root" et ajoutez-le au corps du document.
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);

        //? Appelez la fonction `router()` pour simuler la navigation.
        router({ onNavigate: (path) => {
          //? Vérifiez que la méthode onNavigate a été appelée avec le bon chemin.
          expect(path).toBe(ROUTES_PATH['NewBill']);
        }});

        //? Déclenchez l'événement `onNavigate` avec le chemin `ROUTES_PATH.Bills`
        //? pour simuler la navigation vers la page des factures (bills).
        window.onNavigate(ROUTES_PATH.Bills);

        //? Récupérez le bouton "Nouvelle note de frais".
        const newBillButton = screen.getByTestId('btn-new-bill');

        //? Simulez le clic sur le bouton "Nouvelle note de frais".
        fireEvent.click(newBillButton);
      });


      //! TEST : Test d'intégration -> GET
      describe("When I navigate to Bills Page", () => {
        test("fetches bills from mock API GET", async () => {
          localStorage.setItem("user", JSON.stringify({ 
            type:"Employee",
            email:"a@a",
            password:"employee",
            status:"connected"
          }));
          const root = document.createElement("div")
          root.setAttribute("id", "root")
          document.body.append(root)
          router()
          window.onNavigate(ROUTES_PATH.Bills)
          await waitFor(() => {
            expect(screen.getByText("accepted")).toBeTruthy()
            expect(screen.getAllByText("pending")).toBeTruthy()
            expect(screen.getAllByText("refused")).toBeTruthy()
          })
        })
        
        describe("When an error occurs on API", () => {
          beforeEach(() => {
            jest.spyOn(mockStore, "bills")

            Object.defineProperty(
                window,
                'localStorage',
                { value: localStorageMock }
            )

            window.localStorage.setItem('user', JSON.stringify({
              type:"Employee",
              email:"a@a",
              password:"employee",
              status:"connected"
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
          })
          
          test("fetches bills from an API and fails with 404 message error", async () => {
      
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list : () =>  {
                  return Promise.reject(new Error("Erreur 404"))
                }
              }})
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
          })
      
          test("fetches messages from an API and fails with 500 message error", async () => {
      
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list : () =>  {
                  return Promise.reject(new Error("Erreur 500"))
                }
              }})
      
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
          })
        })
      });
    });
  });
});
