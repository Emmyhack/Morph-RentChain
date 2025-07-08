export const Button = ({ icon, name, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-6 bg-primary text-[1.7rem] text-nowrap capitalize font-semibold text-white rounded-xl flex items-center gap-x-6 hover:bg-blue-600 hover:scale-95 ${className}`}
    >
      {icon} {name}
    </button>
  );
};

export const ButtonTwo = ({ icon, name, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-6 bg-white cursor-pointer text-primary text-[1.7rem] text-nowrap capitalize font-semibold rounded-xl flex items-center gap-x-6 hover:scale-95 ${className}`}
    >
      {icon} {name}
    </button>
  );
};

export const ButtonThree = ({ icon, name, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-8 py-6 bg-transparent border border-white text-white text-[1.7rem] text-nowrap capitalize font-semibold rounded-xl flex items-center gap-x-6 hover:scale-95 ${className}`}
    >
      {icon} {name}
    </button>
  );
};
