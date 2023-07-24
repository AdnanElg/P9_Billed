/**
 * @jest-environment jsdom
 */

// Test = lorsque j'ouvre une modale aux niveaux du bouton
// Test = mock error 500 et error 504.
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      // ! finir le teste .
    })

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
  })
})
