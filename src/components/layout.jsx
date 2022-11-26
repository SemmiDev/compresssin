const Layout = ({ children }) => {
    return (
        <div className='mockup-phone bg-slate-900 px-12 py-8 shadow shadow-sm shadow-primary border flex justify-center max-w-xl mx-auto mt-3 border-base-300'>
            <div className='flex flex-col justify-center px-4 py-5 border-base-300'>
                {children}
            </div>
        </div>
    );
};

export default Layout;
