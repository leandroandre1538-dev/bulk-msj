import { BrandMark, Alert } from './ui';

// Tarjeta centrada para inicio de sesión y registro.
function AuthCard({ title, subtitle, errors = [], children, footer }) {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-8">
            <div className="w-full max-w-md rounded-4xl bg-surface p-8 sm:p-10">
                <BrandMark className="h-12 w-12" />
                <h1 className="mt-6 text-3xl font-normal text-fg">{title}</h1>
                {subtitle && <p className="mt-2 text-fg-2">{subtitle}</p>}

                {errors.length > 0 && (
                    <div className="mt-6 flex flex-col gap-2">
                        {errors.map((error, index) => (
                            <Alert key={index} type="error">{error}</Alert>
                        ))}
                    </div>
                )}

                <div className="mt-8">{children}</div>
                {footer && <div className="mt-8 text-sm text-fg-2">{footer}</div>}
            </div>
        </div>
    );
}

export default AuthCard;
