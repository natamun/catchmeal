interface Props {
  heading?: 'h2' | 'h3';
}

export function TermsOfServiceContent({ heading: Heading = 'h2' }: Props) {
  return (
    <>
      <Heading>1. Objet du service</Heading>
      <p>
        CatCHMeal est une application de suivi nutritionnel et de composition
        corporelle incluant un assistant virtuel basé sur l'intelligence
        artificielle.
      </p>

      <Heading>2. Avertissement médical et d'assistance IA</Heading>
      <ul>
        <li>
          <strong>Aucun conseil médical :</strong> L'application, ses calculs de
          composition corporelle (BMR, Katch-McArdle, masse grasse, etc.) et
          l'assistant IA fournissent des estimations à titre purement indicatif
          et éducatif.
        </li>
        <li>
          <strong>Modèle de langage (LLM de Mistral AI) :</strong> L'assistant
          IA peut parfois générer des informations inexactes ou imprécises.
          L'utilisateur ne doit pas s'appuyer sur les réponses de l'IA pour
          établir un régime médical, traiter un trouble alimentaire ou
          diagnostiquer une condition médicale.
        </li>
        <li>
          <strong>Consultation professionnelle :</strong> En cas de doute ou de
          pathologie particulière, consultez un médecin ou un diététicien
          diplômé.
        </li>
      </ul>

      <Heading>3. Données de santé et consentement</Heading>
      <p>
        En créant un compte et en renseignant vos métriques de composition
        corporelle (masse grasse, masse musculaire, eau corporelle, etc.), vous
        consentez expressément au traitement de ces données de santé sensibles
        pour le bon fonctionnement des fonctionnalités de l'application.
      </p>

      <Heading>4. Fonctionnalités sociales et communauté</Heading>
      <p>Si vous utilisez les fonctionnalités sociales de l'application :</p>
      <ul>
        <li>
          Vous êtes responsable des informations ou repas que vous choisissez de
          rendre publics.
        </li>
        <li>
          Il est strictement interdit de publier du contenu diffamatoire,
          incitant à des troubles alimentaires ou contraire aux lois suisses.
        </li>
      </ul>

      <Heading>5. Limitation de responsabilité</Heading>
      <p>
        En tant que projet étudiant en phase de développement/prototype, nous ne
        garantissons pas la disponibilité ininterrompue du service ni l'absence
        totale de bugs.
      </p>
    </>
  );
}
