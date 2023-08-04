import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"
import Actions from './Actions.js'

//? Ajouts de formatDate
import { formatDate } from "../app/format.js"

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${formatDate(bill.date)}</td>
      <td style="display: none">${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
  }

  //? Mise a jour des dates de facons croissante du plus grans aux plus petits
  //? La fonction `rows` prend un tableau `data` en entrée.
  const rows = (data) => {
    //? Vérifie si `data` existe et a une longueur non nulle avant de procéder.
    return (data && data.length) ? 
      //? Si `data` existe et a une longueur non nulle, procède à la suite du traitement :
      //? 1. Trie le tableau `data` en fonction des dates des éléments, du plus récent au plus ancien.
      //? 2. Ensuite, pour chaque élément `bill` du tableau trié, appelle la fonction `row(bill)` pour obtenir une chaîne de caractères représentant cet élément sous forme de ligne.
      //? 3. Concatène toutes les lignes générées à l'étape précédente en une seule chaîne de caractères, sans séparateur.
      data.sort((a, b) => new Date(b.date) - new Date(a.date)).map(bill => row(bill)).join("") 
      : 
      //? Si `data` est vide ou n'existe pas, retourne une chaîne vide.
      "";
  }

  

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}