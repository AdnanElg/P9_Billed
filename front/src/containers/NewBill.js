import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    // ? Ajout d'un sélecteur pour afficher le message d'erreur
    const errorFile = document.querySelector('#errorFile')

    // ? Lorsque l'évenement submit et envoyer :
    formNewBill.addEventListener("submit", (e) => {
      e.preventDefault();

      // ! TEST : 3
      //? Si le fichier sélectionné a une extension .png, .jpeg ou .jpg en envoir le format :
      if (/\.(png|jpe?g)$/i.test(file.value)) {
        this.handleSubmit(e);
      //? Si le fichier sélectionné a une extension différente de .png, .jpeg ou .jpg en affiche le message d'erreur :
      } else {
        errorFile.style.display = "block";
      }
    });

    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  
  handleChangeFile = e => {
    e.preventDefault()
    // ? Ajouts d'un sélecteur pour afficher le message d'erreur :
    const errorFile = document.querySelector('#errorFile')
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]

    // ! TEST : 3
     //? Si le fichier sélectionné a une extension .png, .jpeg ou .jpg en masque le message d'erreur :
      if (/\.(png|jpe?g)$/i.test(fileName)) {
      errorFile.style.display = "none";
    //? Si le fichier sélectionné a une extension différente de .png, .jpeg ou .jpg en affiche le message d'erreur :
    } else {
      errorFile.style.display = "block";
      return false;
    }


    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}
