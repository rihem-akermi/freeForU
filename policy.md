 Voici l'analyse rigoureuse du code source de FreeForU, suivie de la politique d'annulation et de 
  la FAQ adaptées à la réalité technique de la plateforme.                                         
  ──────                                                                                           
  ### 1. Résumé des règles métier réellement implémentées (avec fichiers sources)                  
                                                                                                   
  #### A. Cycle de vie et statuts des réservations                                                 
                                                                                                   
  • Statuts reconnus :                                                                             
      • Les statuts autorisés par l'API sont : "en_attente", "confirmee", "terminee", "rejetee",   
      "annulee", "expiree" (reservations.service.ts:142-152).                                      
      • À la création par un client, le statut initial par défaut est "en_attente" avec            
      agent_confirmed = false et client_confirmed = false (schema.prisma:78-81).                   
                                                                                                   
                                                                                                   
  #### B. Règle d'acceptation / refus par l'Agent                                                  
                                                                                                   
  • Traitement de la demande : Un agent peut passer une réservation de "en_attente" à "confirmee"  
  ou "rejetee" (reservations.service.ts:156-167).                                                  
  • Gestion automatique des conflits d'horaires : Dès qu'un agent confirme une réservation, toutes 
  les autres demandes en attente sur ce même créneau horaire sont automatiquement rejetées         
  (reservations.service.ts:194-211).                                                               
                                                                                                   
  #### C. Règle d'annulation par le Client                                                         
                                                                                                   
  • Délai strict de 24 heures : Un client ne peut annuler sa réservation que si elle est au statut 
  "en_attente" ou "confirmee", et au moins 24 heures avant l'heure prévue du rendez-vous           
  (hoursUntilReservation < 24 déclenche une erreur 400 BadRequestException : "Impossible d'annuler 
  moins de 24h avant le rendez-vous") (reservations.service.ts:222-236).                           
  • Annulation côté Agent non implémentée : Aucun endpoint ne permet à l'agent d'annuler une       
  réservation une fois qu'il l'a confirmée (il peut seulement la rejeter lorsqu'elle est encore    
  "en_attente").                                                                                   
                                                                                                   
  #### D. Achèvement et clôture de la prestation (Double confirmation)                             
                                                                                                   
  • Pour passer au statut "terminee", la réservation doit impérativement avoir été confirmée au    
  préalable ("confirmee"), puis validée à la fois par l'agent ET par le client via l'endpoint      
  /reservations/:id/confirm-completion (agent_confirmed = true et client_confirmed = true)         
  (reservations.service.ts:266-298).                                                               
                                                                                                   
  #### E. Tâches planifiées (Cron)                                                                 
                                                                                                   
  • Expiration et archivage : Une tâche cron toutes les heures passe en "expiree" les demandes     
  restées en attente dont la date est dépassée, et archive les réservations rejetées ou annulées   
  (reservations.service.ts:301-321).                                                               
  • Rappels automatiques : Un e-mail de rappel est envoyé aux deux parties 24 heures avant le      
  rendez-vous (reservations.service.ts:324-395).                                                   
                                                                                                   
  #### F. Tarification des services                                                                
                                                                                                   
  • Deux modes de tarification sont enregistrés en base : fixe ou a_partir_de avec un montant en   
  Dinars Tunisiens (schema.prisma:156-157).                                                        
  ──────                                                                                           
  ### 2. Liste des informations manquantes et incohérences                                         
                                                                                                   
  1. Paiement (Absence totale dans le code) :                                                      
      • Il n'existe aucun module de paiement en ligne, passerelle bancaire (ex: Konnect, Flouci,   
      ClickToPay) ou champ de statut de transaction dans Prisma / NestJS.                          
      • Statut : Règle de paiement en ligne non implémentée. Le règlement réel n'est pas géré par  
      l'application (supposé en direct / sur place, à clarifier formellement par l'équipe).        
  2. Gestion du No-show (Absence du client ou de l'agent) :                                        
      • Il n'existe aucun statut no_show ni mécanisme de pénalité financière ou automatique dans le
      code.                                                                                        
      • Statut : Règle métier non implémentée (À définir par l'équipe FreeForU).                   
  3. Frais d'annulation :                                                                          
      • La plateforme bloque l'annulation technique à moins de 24h, mais n'applique ni ne prélève  
      de frais financiers (puisqu'aucun paiement n'est collecté en amont).                         
  4. Coordonnées de support :                                                                      
      • Dans l'interface vitrine (Contact.tsx:71-96), l'email affiché est contact@freeforu.tn et   
      les horaires sont Lun - Sam | 08:00 - 19:00. En revanche, le numéro de téléphone est un      
      numéro fictif d'exemple : +216 71 000 000 (Numéro réel : à définir par l'équipe FreeForU).   
                                                                                                   
  ──────                                                                                           
  ### 3. Politique d'annulation proposée                                                           
                                                                                                   
  #### Conditions et Politique d'Annulation – FreeForU                                             
                                                                                                   
  ##### 1. Modalités et délais d'annulation par le Client                                          
                                                                                                   
  • Annulation autorisée (sans frais) : Vous pouvez annuler votre réservation directement depuis   
  votre compte client tant que celle-ci est au statut « En attente » ou « Confirmée », au plus tard
  24 heures avant l’heure prévue de l'intervention.                                                
  • Annulation à moins de 24 heures : Le système bloque automatiquement toute annulation en ligne  
  effectuée à moins de 24 heures du rendez-vous afin de protéger le planning du professionnel.     
  Aucun frais bancaire n'est prélevé par la plateforme ; toutefois, vous devez contacter le support
  ou l'agent pour signaler votre empêchement.                                                      
                                                                                                   
  ##### 2. Annulation par le Prestataire (Agent)                                                   
                                                                                                   
  • L'agent dispose de la possibilité d'accepter ou de refuser une demande en attente.             
  • Si un imprévu survient pour un rendez-vous déjà confirmé, l'agent ne peut pas annuler          
  directement via son interface : la procédure exacte de désistement de l'agent est à définir par  
  l'équipe FreeForU.                                                                               
                                                                                                   
  ##### 3. Absences au rendez-vous (No-show)                                                       
                                                                                                   
  • Si le client ou l'artisan ne se présente pas au rendez-vous fixé, la plateforme ne procède à   
  aucune retenue automatique : les sanctions ou compensations applicables en cas de non-           
  présentation sont à définir par l'équipe FreeForU. En cas d'absence constatée, contactez le      
  support via le formulaire du site.                                                               
                                                                                                   
  ##### 4. Validation de fin d'intervention et Paiement                                            
                                                                                                   
  • Validation : À la fin de la prestation, le client et l'artisan doivent tous les deux confirmer 
  l'achèvement sur leur espace respectif pour que la réservation soit clôturée au statut « Terminée
  ».                                                                                               
  • Règlement : Aucun paiement n'est encaissé sur le site FreeForU. Les modalités de règlement (sur
  place auprès de l'agent) sont à définir par l'équipe FreeForU.                                   
  ──────                                                                                           
  ### 4. FAQ finale (Prête pour l'assistant IA de FreeForU)                                        
                                                                                                   
  Q1 : Quel est le délai pour annuler une réservation sur FreeForU ?                               
                                                                                                   
  │ Vous pouvez annuler votre réservation sans frais jusqu'à 24 heures avant l'heure prévue du     
  │ rendez-vous depuis votre espace personnel. À moins de 24 heures du créneau, le système ne      
  permet                                                                                           
  │ plus l'annulation en ligne.                                                                    
                                                                                                   
  Q2 : Des frais me seront-ils débités si j'annule ma réservation ?                                
                                                                                                   
  │ Non. FreeForU n'enregistre aucune transaction bancaire lors de la réservation et ne prélève    
  │ aucun frais d'annulation. Nous vous invitons toutefois à respecter le délai de 24 heures afin  
  de                                                                                               
  │ ne pas pénaliser le professionnel.                                                             
                                                                                                   
  Q3 : Comment savoir si ma demande de réservation a été acceptée ?                                
                                                                                                   
  │ Lorsque vous soumettez une demande, elle est « En attente ». L'agent reçoit une notification   
  par                                                                                              
  │ e-mail et peut l'accepter ou la refuser. Dès qu'il la confirme, vous recevez un e-mail de      
  │ confirmation reprenant la date et l'horaire retenus.                                           
                                                                                                   
  Q4 : Que se passe-t-il si un agent refuse ma demande ou si le créneau expire ?                   
                                                                                                   
  │ Si l'agent refuse votre demande ou s'il confirme une autre prestation sur la même plage horaire,
  │ votre demande passe au statut « Rejetée » et vous en êtes informé par e-mail. Si la date du    
  │ rendez-vous passe sans réponse de l'agent, la réservation expire automatiquement. Vous pouvez  
  │ alors réserver un autre agent disponible.                                                      
                                                                                                   
  Q5 : Que se passe-t-il en cas d'absence au rendez-vous (du client ou de l'agent) ?               
                                                                                                   
  │ La plateforme ne gère pas de pénalité automatique en cas d'absence (règles et démarches à      
  │ définir par l'équipe FreeForU). Si votre prestataire ne se présente pas ou si vous avez un     
  │ contretemps urgent, signalez-le immédiatement via le formulaire de contact du site.            
                                                                                                   
  Q6 : Comment et quand dois-je payer la prestation ?                                              
                                                                                                   
  │ Le paiement en ligne n'est pas intégré sur la plateforme. Le règlement de la prestation        
  │ s'effectue directement avec le prestataire selon les tarifs indiqués sur son profil (modalités 
  │ précises à définir par l'équipe FreeForU).                                                     
                                                                                                   
  Q7 : Comment marquer une prestation comme terminée ?                                             
                                                                                                   
  │ Une fois la prestation effectuée, l'agent et le client doivent chacun cliquer sur la           
  │ confirmation d'achèvement dans leur espace. Dès que les deux parties ont validé, la réservation
  │ passe définitivement au statut « Terminée ».                                                   
                                                                                                   
  Q8 : Comment contacter le support FreeForU en cas de problème ?                                  
                                                                                                   
  │ Vous pouvez contacter l'assistance en envoyant un message via le formulaire de contact         
  │ disponible sur le site ou par e-mail à contact@freeforu.tn (du lundi au samedi, de 08:00 à     
  │ 19:00). (Numéro de téléphone d'assistance directe à définir par l'équipe FreeForU).    