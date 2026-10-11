export function ConditionsUtilisationContent() {
  return (
    <div className="flex flex-col gap-6 text-sm text-green-600">
      <section>
        <h3 className="mb-2 font-semibold text-green-800">
          1. Objet du service
        </h3>
        <p className="leading-relaxed">
          CatchMeal est une application de suivi nutritionnel et de composition
          corporelle incluant un assistant virtuel basé sur l'intelligence
          artificielle.
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-green-800">
          2. Avertissement médical et d'assistance IA
        </h3>
        <div className="flex flex-col gap-2">
          {[
            {
              title: 'Aucun conseil médical',
              desc: "L'application, ses calculs de composition corporelle (BMR, Katch-McArdle, masse grasse, etc.) et l'assistant IA fournissent des estimations à titre purement indicatif et éducatif.",
            },
            {
              title: 'Modèle de langage (LLM — Mistral AI)',
              desc: "L'assistant IA peut parfois générer des informations inexactes ou imprécises. L'utilisateur ne doit pas s'appuyer sur les réponses de l'IA pour établir un régime médical, traiter un trouble alimentaire ou diagnostiquer une condition médicale.",
            },
            {
              title: 'Consultation professionnelle',
              desc: 'En cas de doute ou de pathologie particulière, consultez un médecin ou un diététicien diplômé.',
            },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-3"
            >
              <p className="mb-1 font-semibold text-green-700">{title}</p>
              <p className="leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-green-800">
          3. Données de santé et consentement
        </h3>
        <p className="leading-relaxed">
          En créant un compte et en renseignant vos métriques de composition
          corporelle (masse grasse, graisse viscérale, hydratation, etc.), vous
          consentez expressément au traitement de ces données de santé sensibles
          pour le bon fonctionnement des fonctionnalités de l'application.
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-green-800">
          4. Fonctionnalités sociales et communauté
        </h3>
        <div className="flex flex-col gap-1">
          {[
            'Vous êtes responsable des informations ou repas que vous choisissez de rendre publics.',
            'Il est strictement interdit de publier du contenu diffamatoire, incitant à des troubles alimentaires ou contraire aux lois suisses.',
          ].map((item, i) => (
            <p key={i} className="flex gap-2 leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
              {item}
            </p>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-green-800">
          5. Limitation de responsabilité
        </h3>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          En tant que projet étudiant en phase de développement/prototype, nous
          ne garantissons pas la disponibilité ininterrompue du service ni
          l'absence totale de bugs.
        </div>
      </section>
    </div>
  );
}
