import './TrustedClients.css';

const TrustedClients = () => {
    // Using simple text-based logos or clean SVGs for the "As Seen In" look
    // These match screenshot 2's aesthetic better than heavy corporate logos
    const clients = [
        { name: 'Spazio', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/368px-Google_2015_logo.svg.png' }, // Placeholder for text logo
        { name: 'Gamarance', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/603px-Amazon_logo.svg.png' },
        { name: 'Gasparyan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/512px-Adidas_Logo.svg.png' },
        { name: 'Ocean', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png' },
        { name: 'Fembreeque', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png' },
        { name: 'Helveior', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/512px-IBM_logo.svg.png' },
        { name: 'Rodond', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/505px-Apple_logo_black.svg.png' },
    ];

    // Note: The URLs above are placeholders. In a real scenario, use actual assets or text. 
    // To mimic screenshot 2 EXACTLY, let's just use text spans styled like logos if images aren't critical,
    // but the user wants "like this", implying visual similarity.
    // Let's stick to the previous real client list but styled to look like the Screenshot 2 clean text logos.

    const realClients = [
        { name: 'Paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
        { name: 'Accenture', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg' },
        { name: 'HP', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/HP_logo_2012.svg' },
        { name: 'Honda', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/38/Honda.svg' },
        { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
        { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    ];

    return (
        <section className="trusted-clients-section">
            <div className="container">
                <div className="trusted-header">
                    <h3>AS SEEN IN</h3>
                </div>
                <div className="clients-box">
                    {realClients.map((client, index) => (
                        <div key={index} className="client-logo">
                            <img src={client.logo} alt={client.name} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustedClients;
