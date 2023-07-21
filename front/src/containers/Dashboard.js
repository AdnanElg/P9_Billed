import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"


//? Cette fonction filtre les factures en fonction du statut fourni et de l'e-mail de l'utilisateur (si ce n'est pas dans l'environnement de test Jest).
export const filteredBills = (data, status) => {
  //? Vérifie si les données existent et contiennent des éléments
  return (data && data.length) ?
    //? Filtrer le tableau de données (factures) en fonction de la condition de sélection
    data.filter(bill => {
      let selectCondition

      //? Environnement Jest
      if (typeof jest !== 'undefined') {
        //? La condition de sélection est basée uniquement sur le statut de la facture
        selectCondition = (bill.status === status)
      }
      /* istanbul ignore next */
      else {
        //? Environnement de production
        //? Récupération de l'e-mail de l'utilisateur à partir du stockage local
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        //? La condition de sélection inclut à la fois le statut de la facture et l'exclusion des e-mails spécifiques
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : [] //? Retourne un tableau vide si les données sont nulles ou ne contiennent pas d'éléments
}




//? Cette fonction génère une carte HTML pour afficher les informations d'une facture.
export const card = (bill) => {
  //? Extraction du prénom et du nom à partir de l'e-mail de la facture
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[1] : firstAndLastNames

  //? Retourne une chaîne de caractères représentant la carte HTML de la facture
  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}



//? Cette fonction génère une chaîne de caractères contenant les cartes HTML de toutes les factures fournies.
export const cards = (bills) => {
  //? Vérifie si les factures existent et contiennent des éléments
  return bills && bills.length ?
    //? Utilise la fonction `map` pour itérer sur chaque facture et appeler la fonction `card` pour générer la carte HTML de chaque facture.
    //? Enfin, la méthode `join` est utilisée pour fusionner toutes les cartes HTML en une seule chaîne de caractères.
    bills.map(bill => card(bill)).join("") : ""
}



//? Cette fonction prend un index en entrée et renvoie le statut correspondant en fonction de l'index.
export const getStatus = (index) => {
  //? Utilisation d'une instruction switch pour traiter différents cas en fonction de la valeur de l'index.
  switch (index) {
    case 1:
      //? Si l'index est égal à 1, le statut est "pending" (en attente).
      return "pending";
    case 2:
      //? Si l'index est égal à 2, le statut est "accepted" (accepté).
      return "accepted";
    case 3:
      //? Si l'index est égal à 3, le statut est "refused" (refusé).
      return "refused";
    default:
      //? Si l'index ne correspond à aucun des cas ci-dessus, la fonction renvoie undefined (non défini).
      return undefined;
  }
}



//? Classe par défaut représentant un composant.
export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    //? Initialisation des propriétés de la classe à partir des paramètres d'entrée.
    this.document = document
    this.onNavigate = onNavigate
    this.store = store

    //? Ajout d'événements de clic aux icônes de flèche pour afficher les tickets correspondants.
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))

    //? Création d'une instance de la classe Logout pour gérer la déconnexion.
    new Logout({ localStorage, onNavigate })
  }


  //? Cette méthode est appelée lorsqu'on clique sur l'icône "eye" (œil) pour afficher la facture en grand dans une modale.
  handleClickIconEye = () => {
    //? Récupération de l'URL de la facture à partir de l'attribut "data-bill-url" de l'icône "eye".
    const billUrl = $('#icon-eye-d').attr("data-bill-url")

    //? Calcul de la largeur de l'image pour s'assurer qu'elle ne dépasse pas 80% de la largeur de la modale.
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)

    //? Remplacement du contenu de la div "modal-body" de la modale par l'image de la facture.
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`)

    //? Vérification si la méthode 'modal' existe et, si oui, affichage de la modale.
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }



  //? Cette méthode est utilisée pour gérer l'édition d'un ticket spécifique.
  handleEditTicket(e, bill, bills) {
    //? Vérifie si le compteur n'est pas défini ou si l'ID ne correspond pas à celui du ticket actuel.
    //? Si c'est le cas, initialise le compteur à 0 et met à jour l'ID du ticket actuel.
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id

    //? Vérifie si le compteur est pair ou impair pour déterminer l'état actuel de l'édition du ticket.
    if (this.counter % 2 === 0) {
      //? État d'édition : Met en surbrillance tous les tickets et met en surbrillance le ticket actuel en particulier.
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill));
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter ++
    } else {
      //? État non édité : Rétablit l'arrière-plan par défaut du ticket actuel et affiche une icône de ticket important.
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' });

      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);

      $('.vertical-navbar').css({ height: '120vh' });
      this.counter ++
    }

    //? Associe les gestionnaires d'événements aux boutons et à l'icône d'œil.
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))  
  }



  //? Cette méthode est appelée lorsque l'utilisateur soumet une action d'acceptation pour une facture.
  handleAcceptSubmit = (e, bill) => {
    //? Crée une nouvelle facture en copiant les propriétés de la facture actuelle (bill).
    //? Met à jour le statut de la facture à 'accepted' et récupère le commentaire administratif du formulaire.
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }

    //? Appelle la méthode "updateBill" pour mettre à jour la facture avec les nouvelles informations.
    this.updateBill(newBill)

    //? Navigue vers le tableau de bord une fois que la facture a été mise à jour.
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }



  //? Cette méthode est appelée lorsque l'utilisateur soumet une action de refus pour une facture.
  handleRefuseSubmit = (e, bill) => {
    //? Crée une nouvelle facture en copiant les propriétés de la facture actuelle (bill).
    //? Met à jour le statut de la facture à 'refused' et récupère le commentaire administratif du formulaire.
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }

    //? Appelle la méthode "updateBill" pour mettre à jour la facture avec les nouvelles informations.
    this.updateBill(newBill)

    //? Navigue vers le tableau de bord une fois que la facture a été mise à jour.
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }


  //? Cette méthode est utilisée pour afficher ou masquer les tickets en fonction de l'index donné.
  handleShowTickets(e, bills, index) {
    console.log(bills)
    console.log(index);
    //? Vérifie si le compteur n'est pas défini ou si l'index ne correspond pas à celui actuel.
    //? Si c'est le cas, initialise le compteur à 0 et met à jour l'index actuel.
    if (this.counter === undefined || this.index !== index) this.counter = 0
    if (this.index === undefined || this.index !== index) this.index = index

    //  ! supression if (this.counter % 2 === 0) et ajout de if (this.counter !== undefined).
    //? Vérifie si le compteur est défini (l'état d'affichage est déjà initialisé).
    if (this.counter !== undefined) {
      //? Si le compteur est défini, cela signifie que l'affichage est déjà initialisé.
      //? On effectue les actions suivantes pour basculer entre l'affichage et la masquage des tickets.

      //? Change l'angle de rotation de l'icône de flèche pour indiquer l'état d'affichage des tickets.
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)' })

      //? Affiche les tickets correspondants en utilisant la fonction "cards" et "filteredBills".
      $(`#status-bills-container${this.index}`).html(cards(filteredBills(bills, getStatus(this.index))))

      //? Incrémente le compteur pour basculer l'état d'affichage lors du prochain appel.
      this.counter++
    } else {
      //? Si le compteur n'est pas défini, cela signifie que l'affichage n'a pas encore été initialisé.
      //? On effectue les actions suivantes pour masquer les tickets correspondants.

      //? Change l'angle de rotation de l'icône de flèche pour indiquer l'état de masquage des tickets.
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)' })

      //? Efface le contenu HTML du conteneur des tickets pour les masquer.
      $(`#status-bills-container${this.index}`).html("")

      //? Incrémente le compteur pour basculer l'état d'affichage lors du prochain appel.
      this.counter++
    }

    //? Associe le gestionnaire d'événement "click" à chaque ticket pour l'édition.
    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })

    //? Retourne les tickets après les modifications.
    return bills
  }


  

  //? Cette méthode est utilisée pour obtenir toutes les factures de tous les utilisateurs depuis la base de données.
  getBillsAllUsers = () => {
    //? Vérifie si le magasin (store) est défini.
    if (this.store) {
      //? Si le magasin (store) est défini, effectue une requête pour récupérer toutes les factures.
      //? Utilise la méthode "list()" pour obtenir un snapshot (instantané) des factures.
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          //? Mappe le snapshot pour transformer chaque document en un objet avec les propriétés nécessaires.
          //? Chaque objet contient un ID unique (id), ainsi que les autres propriétés "date" et "status".
          const bills = snapshot
            .map(doc => ({
              id: doc.id,
              ...doc,
              date: doc.date,
              status: doc.status
            }));
          //? Renvoie le tableau contenant toutes les factures une fois qu'elles ont été transformées.
          return bills;
        })
        .catch(error => {
          //? En cas d'erreur lors de la requête, renvoie l'erreur.
          throw error;
        });
    }
  }




  // not need to cover this function by tests
  /* istanbul ignore next */

 //? Cette méthode est utilisée pour mettre à jour une facture dans la base de données.
  updateBill = (bill) => {
    //? Vérifie si le magasin (store) est défini.
    if (this.store) {
      //? Si le magasin (store) est défini, effectue une requête pour mettre à jour la facture dans la base de données.
      //? Utilise la méthode "update" pour mettre à jour la facture en fournissant les données au format JSON (stringifiées)
      //? et en utilisant l'identifiant de la facture (bill.id) comme sélecteur.
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id })
        .then(bill => bill) //? Renvoie la facture mise à jour en cas de succès.
        .catch(console.log); //? Affiche l'erreur dans la console en cas d'échec.
    }
  }
}
