const RadialProgress = ({ percent }) => {
    return (
        <span
            className='radial-progress bg-primary text-primary-content border-3 border-primary'
            style={{ '--value': percent }}
        >
            {percent.toFixed(0)}%
        </span>
    );
};

export default RadialProgress;
