// src/components/ui/Button.js
export const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    ghost: 'hover:bg-gray-100'
  };
  
  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-2 py-1 text-sm'
  };

  return (
    <button 
      className={`rounded-md transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// src/components/ui/Card.js
export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-lg shadow-lg ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h2 className={`text-2xl font-bold ${className}`} {...props}>
    {children}
  </h2>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// src/components/ui/Input.js
export const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  />
);

