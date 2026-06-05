import React from 'react';

type ButtonVariant = 'primary' | 'ghost';

interface ButtonProps {
  href?: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Button({ href, variant = 'primary', children, className = '' }: ButtonProps) {
  const cls = `button button-${variant} ${className}`.trim();

  if (href) {
    return <a href={href} className={cls}>{children}</a>;
  }

  return <button className={cls}>{children}</button>;
}
