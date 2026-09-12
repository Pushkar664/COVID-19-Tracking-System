const StatCard = ({ title, value, icon, description }) => {

    return (
        <div className="stat-card">

            <div className="stat-card-top">

                <div>
                    <p className="stat-title">
                        {title}
                    </p>

                    <h2>
                        {Number(value || 0).toLocaleString()}
                    </h2>
                </div>

                <div className="stat-icon">
                    {icon}
                </div>

            </div>

            {description && (
                <p className="stat-description">
                    {description}
                </p>
            )}

        </div>
    );
};

export default StatCard;