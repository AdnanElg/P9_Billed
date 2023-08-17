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
    //? La fonction "initialisationBills" est utilisée pour initialiser l'application des factures.
    function initialisationBills() {
      //? On remplace le contenu du body par le rendu de l'interface utilisateur des factures en utilisant les données "bills".
      document.body.innerHTML = BillsUI({ data: bills });

      //? On crée une fonction "onNavigate" qui sera utilisée pour simuler la navigation.
      const onNavigate = jest.fn(() => {});

      //? On utilise le mockStore pour simuler un magasin Redux.
      const store = mockStore;

      //? On crée un objet d'utilisateur simulé pour le stocker dans le localStorage.
      const userObj = {
        type: "Employee",
        email: "employee@test.tld",
        password: "employee",
        status: "connected",
      };

      //? On définit une propriété personnalisée "localStorage" pour la fenêtre (pour éviter les erreurs).
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      //? On stocke l'objet utilisateur simulé dans le localStorage.
      window.localStorage.setItem('user', JSON.stringify(userObj));
      //? On instancie un nouvel objet "Bills" avec les paramètres nécessaires pour les tests.
      return new Bills({ document, onNavigate, store, localStorage });
    };
 
    //? Une variable pour stocker l'objet "Bills" initialisé avant chaque test.
    let theBills;
    beforeEach(() => {
      //? On initialise l'objet "Bills" avant chaque test en utilisant la fonction "initialisationBills".
      theBills = initialisationBills();
    });

    // ***************************************************************************
    // *** TEST FONCTIONNELS && TEST UNITAIRES ***
    // ***************************************************************************
    
    // ! TEST : Ensuite, l'icône de facturation dans la disposition verticale devrait être mise en évidence :
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });


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
        $.fn.modal = jest.fn(); 

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

        //? Instanciez un objet Bills pour gérer l'affichage des factures.
        const billsContainer = new Bills({
          document, onNavigate, store: mockStore, localStorage: window.localStorage
        });

        //? Récupérez l'icône "eye" en utilisant un attribut de test (test ID).
        const eyeIcon = screen.getByTestId('icon-eye');

        //? Créez une fonction de rappel pour ouvrir la modale lorsqu'on clique sur l'icône "eye".
        const openModale = jest.fn(billsContainer.handleClickIconEye(eyeIcon));

        //? Ajoutez un écouteur d'événement pour le clic sur l'icône "eye".
        eyeIcon.addEventListener('click', openModale);

        //? Simulez le clic sur l'icône "eye".
        fireEvent.click(eyeIcon);

        //? Vérifiez si la fonction d'ouverture de la modale a été appelée.
        expect(openModale).toHaveBeenCalled();

        //? Vérifiez si la modale contenant les détails de la facture est affichée.
        const modalEmploye = screen.getByTestId('modaleEmployee');
        expect(modalEmploye).toBeTruthy();
    });


    // ! TEST : Ensuite, en cliquant sur le bouton 'Nouvelle note de frais', je devrais être redirigé vers le formulaire Nouvelle Note de frais :
    test("Then clicking on the 'Nouvelle note de frais' button should redirect to NewBill form", () => {
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
    

    // ***************************************************************************
    // *** TEST INTÉGRATION ***
    // ***************************************************************************

    //! TEST : Test d'intégration -> GET
    describe("When I navigate to the invoices page", () => {
        //? Définit un test qui récupère les factures depuis une API fictive via GET
        test("fetch invoices from mock API via GET", async () => { 
          //? Crée un élément "div" pour servir de racine de l'application
          const root = document.createElement("div");
          root.setAttribute("id", "root");
          document.body.append(root);
          
          //? Charge le routeur de l'application
          router();
          
          //? Déclenche le changement de route vers la page des factures
          window.onNavigate(ROUTES_PATH.Bills);
          
          //? Attend que les éléments "accepted", "pending" et "refused" soient présents dans l'interface
          await waitFor(() => {
            expect(screen.getByText("accepted")).toBeTruthy();
            expect(screen.getAllByText("pending")).toBeTruthy();
            expect(screen.getAllByText("refused")).toBeTruthy();
          });
        });
        
        //? Définit une autre suite de tests pour le cas où une erreur survient dans l'API
        describe("When an error occurs in the API", () => {
          beforeEach(() => {
            //? On utilise "jest.spyOn" pour espionner la fonction "bills" du mockStore
            jest.spyOn(mockStore, "bills");
            
            //? On définit une propriété personnalisée "localStorage" pour la fenêtre (pour éviter les erreurs)
            Object.defineProperty(
                window,
                'localStorage',
                { value: localStorageMock }
            );
            
            //? Crée un élément "div" pour servir de racine de l'application
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            
            //? Charge le routeur de l'application
            router();
        });
          
        //? Définit un test qui récupère les factures depuis l'API mais échoue avec un message d'erreur 404
        test("fetches invoices from API but fails with 404 error message", async () => {
        
            //? On substitue temporairement la fonction "bills" du mockStore pour qu'elle renvoie une promesse rejetée avec l'erreur "Erreur 404"
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 404"));
                }
              };
            });
            
            //? Déclenche le changement de route vers la page des factures
            window.onNavigate(ROUTES_PATH.Bills);
            
            //? Attend que l'interface affiche le message d'erreur "Erreur 404"
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });
        
        //? Définit un test qui récupère les messages depuis l'API mais échoue avec un message d'erreur 500
        test("fetches messages from API but fails with a 500 error message", async () => {
        
            //? On substitue temporairement la fonction "bills" du mockStore pour qu'elle renvoie une promesse rejetée avec l'erreur "Erreur 500"
            mockStore.bills.mockImplementationOnce(() => {
              return {
                list: () => {
                  return Promise.reject(new Error("Erreur 500"));
                }
              };
            });
        
            //? Déclenche le changement de route vers la page des factures
            window.onNavigate(ROUTES_PATH.Bills);
        
            //? Attend que l'interface affiche le message d'erreur "Erreur 500"
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
      });
    });
  });
});
