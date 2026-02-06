import Link from 'next/link';

export default function AccesRequisPage() {
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col items-center fr-container main-content-item my-32 text-center'>
                <h1 className='fr-h3 mb-4'>Connexion requise</h1>
                <p className='mb-6'>
                    Cette fonctionnalité nécessite un compte. Veuillez vous connecter ou créer un compte pour y accéder.
                </p>
                <Link href='/connexion' className='fr-btn'>
                    Se connecter
                </Link>
            </div>
        </div>
    );
}
