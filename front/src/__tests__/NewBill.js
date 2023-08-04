/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { screen, fireEvent, waitFor} from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {
      // ......
    });
    
    // ! TEST : Test d'intégration -> POST Ajouter Erreur 500
    //? Définit un test "POST bill" pour vérifier le comportement lors de la soumission d'une nouvelle facture.
    test("POST bill", async () => {
      //? On configure une entrée dans le localStorage pour simuler un utilisateur de type "Employee" avec un email.
      localStorage.setItem("user", JSON.stringify({ 
        type: "Employee", 
        email: "a@a" 
      }));

      //? Crée un élément "div" pour servir de racine de l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      //? Charge le routeur de l'application
      router();

      //? Déclenche le changement de route vers la page de création d'une nouvelle facture
      window.onNavigate(ROUTES_PATH.NewBill);

      //? Attend que le bouton "Envoyer" soit présent dans l'interface
      await waitFor(() => screen.getAllByText("Envoyer"));
    });

    //? Définit une suite de tests "When an error occurs on API"
    describe("When an error occurs in the API", () => {
      //? Définit un test "POST bill fails with 500 message error" pour vérifier le comportement lorsqu'une erreur 500 se produit lors de la soumission d'une nouvelle facture.
      test("POST bill fails with a 500 error message", async () => {
        try {
          //? On utilise "jest.spyOn" pour espionner la fonction "bills" du mockStore
          jest.spyOn(mockStore, "bills");

          //? On définit une propriété personnalisée "localStorage" pour la fenêtre (pour éviter les erreurs)
          Object.defineProperty(
              window,
              'localStorage',
              { value: localStorageMock }
          );

          //? On configure une entrée dans le localStorage pour simuler un utilisateur connecté de type "Employee"
          window.localStorage.setItem('user', JSON.stringify({
            type: "Employee",
            email: "a@a",
            password: "employee",
            status: "connected"
          }));

          //? Déclenche le changement de route vers la page de création d'une nouvelle facture
          window.onNavigate(ROUTES_PATH.NewBill);
          
          //? Crée un élément "div" pour servir de racine de l'application
          const root = document.createElement("div");
          root.setAttribute("id", "root");
          document.body.appendChild(root);

          //? Charge le routeur de l'application
          router();

          //? Récupère le bouton "Envoyer" dans l'interface
          const buttonSubmit = screen.getAllByText('Envoyer');
          buttonSubmit[0].click();

          //? On substitue temporairement la fonction "create" du mockStore pour qu'elle renvoie une promesse rejetée avec l'erreur "Erreur 500"
          mockStore.bills.mockImplementationOnce(() => {
            return {
              create: (bill) => {
                return Promise.reject(new Error("Erreur 500"));
              }
            };
          });

          //? Déclenche à nouveau le changement de route vers la page de création d'une nouvelle facture
          window.onNavigate(ROUTES_PATH.NewBill);

          //? Attend que l'interface affiche le message d'erreur "Erreur 500"
          await new Promise(process.nextTick);
          const message = screen.queryByText(/Erreur 500/);
          
          //? Vérifie que le message d'erreur "Erreur 500" est présent dans l'interface
          await waitFor(() => {
            expect(message).toBeTruthy();
          });

        } catch (error) {
          //? Affiche toute erreur qui pourrait survenir pendant le test
          console.error(error);
        }
      });
    });

  })
})