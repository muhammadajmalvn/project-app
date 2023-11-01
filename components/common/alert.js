export function Error({ message }) {
    return (
      <div className="bg-red-100 border border-danger text-danger rounded relative mb-2 text-center">
        <span className="sm:inline block">{message}</span>
      </div>
    );
  }
  export function Success({ message }) {
    return (
      <div className="bg-green-100 border border-success text-success px-4 py-3 rounded relative mb-2 text-center">
        <span className="sm:inline block">{message}</span>
      </div>
    );
  }