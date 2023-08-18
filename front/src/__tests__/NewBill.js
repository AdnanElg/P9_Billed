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

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("when upload file", () => {
      //? La fonction "initialisationBills" est utilisée pour initialiser l'application des factures.
      function initialisationNewBill(){
        const html = NewBillUI()
        document.body.innerHTML = html

        //? Simuler onNavigate
        const onNavigate = jest.fn(()=>{})

        //? Simuler store
        const store = mockStore

        //? Crer un user 
        const userObj = {
          type:"Employee",
          email:"employee@test.tld",
          password:"employee",
          status:"connected"
        }
        
        //? Simuler localStore avec le user dedans 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock }) 
        window.localStorage.setItem('user', JSON.stringify(userObj))

        //? Création d'un nouveau NewBill
        return new NewBill({document,onNavigate,store,locaStore: window.localStorage})
      }

      //? Déclaration de newbill à utiliser
      let NewBills
      beforeEach(() => {
        NewBills = initialisationNewBill()
      });

      // ***************************************************************************
      // *** TEST FONCTIONNELS && TEST UNITAIRES ***
      // ***************************************************************************

      //! TEST : Ce test vérifie le comportement lorsque vous essayez d'uploader un fichier  qui a un format inacceptable (PDF).
      test("I am sending a file that is an image but with an unacceptable format (PDF)", () => {
        //? Crée un gestionnaire d'événement fictif (onNavigate) pour simuler la navigation dans votre application.
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES_PATH({ pathname });
        };
      
        //? Instancie un objet NewBill en passant les éléments nécessaires.
        const newBills = new NewBill({
          document,
          onNavigate,
          localStorage: window.localStorage,
        });
      
        //? Déclare une fonction factice (handleChangeFile) et l'espionne à l'aide de jest.fn().
        const handleChangeFile = jest.fn(() => newBills.handleChangeFile);
      
        //? Sélectionne l'élément de fichier dans le DOM à l'aide de getByTestId.
        const fileInput = screen.getByTestId("file");
      
        //? Sélectionne l'élément d'erreur dans le DOM à l'aide de querySelector.
        const errorFile = document.querySelector('#errorFile');
      
        //? Ajoute l'événement change à l'élément de fichier et associe la fonction factice handleChangeFile.
        fileInput.addEventListener("change", handleChangeFile);
      
        //? Déclenche l'événement change sur l'élément de fichier en simulant le téléchargement d'un fichier PDF (au lieu d'une image).
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["image-test.pdf"], "image-test.pdf", {
                type: "image/pdf",
              }),
            ],
          },
        });
      
        //? Vérifie que la valeur de l'élément de fichier est réinitialisée (vide).
        expect(fileInput.value).toBe("");
      
        //? Vérifie que la propriété fileUrl de l'objet NewBill est toujours à null.
        expect(newBills.fileUrl).toBeNull();
      
        //? Vérifie que l'élément errorFile a le style display à "block" après le changement de fichier.
        expect(errorFile.style.display).toBe("block");
      });
      
      //! TEST : Ce test vérifie le comportement lorsque vous essayez d'uploader un fichier un format acceptable (png).
      test("Sending an acceptable image file format (PNG)", () => {
        //? Crée un gestionnaire d'événement fictif (onNavigate) pour simuler la navigation dans votre application.
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES_PATH({ pathname });
        };
      
        //? Instancie un objet NewBill en passant les éléments nécessaires.
        const newBills = new NewBill({
          document,
          onNavigate,
          localStorage: window.localStorage,
        });
      
        //? Déclare une fonction factice (handleChangeFile) et l'espionne à l'aide de jest.fn().
        const handleChangeFile = jest.fn(() => newBills.handleChangeFile);
      
        //? Sélectionne l'élément de fichier dans le DOM à l'aide de getByTestId.
        const fileInput = screen.getByTestId("file");
      
        //? Sélectionne l'élément d'erreur dans le DOM à l'aide de querySelector.
        const errorFile = document.querySelector('#errorFile');
      
        //? Ajoute l'événement change à l'élément de fichier et associe la fonction factice handleChangeFile.
        fileInput.addEventListener("change", handleChangeFile);
      
        //? Déclenche l'événement change sur l'élément de fichier en simulant le téléchargement d'un fichier PNG.
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["image-test.png"], "image-test.png", {
                type: "image/png",
              }),
            ],
          },
        });
      
        //? Vérifie que la valeur de l'élément de fichier est réinitialisée (vide).
        expect(fileInput.value).toBe("");
      
        //? Vérifie que la propriété fileUrl de l'objet NewBill n'est pas nulle.
        expect(newBills.fileUrl).not.toBeNull();
      
        //? Vérifie que l'élément errorFile a le style display à "none" après le changement de fichier.
        expect(errorFile.style.display).toBe("none");
      });

      //! TEST : Ce test vérifie le comportement lorsque vous essayez d'envoyer les donées du formulaire et que le fichoer n'est pas acceptable (PDF).
      test("Submitting the form with an unacceptable image file format (PDF)", () => {
        //? Crée un gestionnaire d'événement fictif (onNavigate) pour simuler la navigation dans votre application.
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES_PATH({ pathname });
        };
      
        //? Instancie un objet NewBill en passant les éléments nécessaires.
        const newBills = new NewBill({
          document,
          onNavigate,
          localStorage: window.localStorage,
        });
      
        //? Déclare une fonction factice (handleSubmit) et l'espionne à l'aide de jest.fn().
        const handleSubmit = jest.fn(() => newBills.handleSubmit);
      
        //? Sélectionne l'élément de formulaire dans le DOM à l'aide de getByTestId.
        const formElement = screen.getByTestId("form-new-bill");
      
        //? Sélectionne l'élément de fichier dans le DOM à l'aide de getByTestId.
        const fileInput = screen.getByTestId("file");
      
        //? Sélectionne l'élément d'erreur dans le DOM à l'aide de querySelector.
        const errorFile = document.querySelector('#errorFile');
      
        //? Ajoute l'événement submit au formulaire et associe la fonction factice handleSubmit.
        formElement.addEventListener("submit", handleSubmit);
      
        //? Déclenche l'événement change sur l'élément de fichier en simulant le téléchargement d'un fichier PDF.
        fireEvent.change(fileInput, {
          target: {
            files: [
              new File(["image-test.pdf"], "image-test.pdf", {
                type: "image/pdf",
              }),
            ],
          },
        });
      
        //? Déclenche l'événement submit sur le formulaire.
        fireEvent.submit(formElement);
      
        //? Vérifie que la propriété fileUrl de l'objet NewBill est toujours à null.
        expect(newBills.fileUrl).toBeNull();
      
        //? Vérifie que la fonction handleSubmit n'a pas été appelée (le formulaire n'a pas été soumis).
        expect(handleSubmit).not.toHaveBeenCalled();
      
        //? Vérifie que l'élément errorFile a le style display à "block" après le soumission du formulaire.
        expect(errorFile.style.display).toBe("block");
      });
      
    
      // ***************************************************************************
      // *** TEST INTÉGRATION ***
      // ***************************************************************************

      // ! TEST : Test d'intégration -> POST Ajouter Erreur 500
      //? Définit un test "POST bill" pour vérifier le comportement lors de la soumission d'une nouvelle facture.
      test("POST bill", async () => {
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
    });
  });
});