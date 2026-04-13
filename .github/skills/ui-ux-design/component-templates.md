<!-- Component Templates for OMINA UI/UX -->

# Emergency Button Template

```jsx
import React, { useState } from 'react';

interface EmergencyButtonProps {
  label?: string;
  isLoading?: boolean;
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  label = 'Send SOS',
  isLoading = false,
  onClick,
  disabled = false,
  size = 'large'
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      await onClick();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SOS');
    }
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          w-full md:w-auto
          ${sizeClasses[size]}
          bg-red-600 hover:bg-red-700 disabled:bg-gray-400
          text-white font-semibold rounded-lg
          transition-colors duration-200
          min-h-[48px] md:min-w-[56px]
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          ${isLoading ? 'opacity-75' : ''}
        `}
        aria-label={label}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Sending...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🚨 {label}
          </span>
        )}
      </button>
      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

# Form Field Template

```jsx
import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: ReactNode;
  id: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  helperText,
  children,
  id
}) => {
  return (
    <div className="mb-4 w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-900 mb-2"
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      {children}

      {error && (
        <p id={`${id}-error`} className="text-red-600 text-sm mt-1" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-hint`} className="text-gray-500 text-sm mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};
```

# Mobile Layout Template

```jsx
export const MobileLayout: React.FC<{children: ReactNode}> = ({children}) => (
  <div className="flex flex-col min-h-screen bg-white">
    {/* Main content - scrollable */}
    <main className="flex-1 overflow-y-auto p-4">
      {children}
    </main>

    {/* Bottom navigation - fixed */}
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center">
      <NavigationItem icon="📍" label="Map" />
      <NavigationItem icon="✋" label="Safety" />
      <NavigationItem icon="🚨" label="SOS" />
      <NavigationItem icon="👤" label="Profile" />
    </nav>
  </div>
);
```

These templates follow OMINA design system and accessibility standards.
