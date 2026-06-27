"use client";

import React from "react";
import {
  Bot,
  Briefcase,
  Home,
  Mail,
  Newspaper,
  Rocket,
  type LucideIcon,
} from "lucide-react";

interface GlassEffectProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  onClick?: () => void;
}

interface DockIcon {
  src?: string;
  alt: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  className = "",
  style = {},
  href,
  target = "_blank",
  onClick,
}) => {
  const glassStyle = {
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
    ...style,
  };

  const content = (
    <div
      className={`relative flex overflow-hidden transition-all duration-700 ${className}`}
      style={glassStyle}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 z-0 rounded-[inherit] bg-white/10 backdrop-blur-md"
      />
      <div
        className="absolute inset-0 z-10 rounded-[inherit] border border-white/20"
      />
      <div className="relative z-30 w-full">{children}</div>
    </div>
  );

  return href ? (
    <a href={href} target={target} rel="noopener noreferrer" className="block">
      {content}
    </a>
  ) : (
    content
  );
};

export const GlassDock: React.FC<{ icons: DockIcon[]; href?: string }> = ({
  icons,
  href,
}) => (
  <GlassEffect
    href={href}
    className="rounded-[2rem] p-3 hover:p-4 hover:rounded-[2.5rem]"
  >
    <div className="flex items-center justify-center gap-2 rounded-[2rem] p-1 overflow-hidden">
      {icons.map((icon, index) => {
        const Icon = icon.icon;
        return Icon ? (
          <button
            key={index}
            type="button"
            aria-label={icon.alt}
            className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-[1.4rem] bg-white/10 text-white transition-all duration-700 hover:scale-110 hover:bg-white/20"
            style={{
              transformOrigin: "center center",
              transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
            }}
            onClick={icon.onClick}
          >
            <Icon className="h-7 w-7" />
          </button>
        ) : (
          <img
            key={index}
            src={icon.src}
            alt={icon.alt}
            className="h-16 w-16 cursor-pointer transition-all duration-700 hover:scale-110"
            style={{
              transformOrigin: "center center",
              transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
            }}
            onClick={icon.onClick}
          />
        );
      })}
    </div>
  </GlassEffect>
);

export const GlassButton: React.FC<{
  children: React.ReactNode;
  href?: string;
  className?: string;
}> = ({ children, href, className = "" }) => (
  <GlassEffect
    href={href}
    className={`rounded-[2rem] px-8 py-4 hover:px-9 hover:py-[1.1rem] hover:rounded-[2.35rem] overflow-hidden ${className}`}
  >
    <div
      className="transition-all duration-700 hover:scale-95"
      style={{
        transitionTimingFunction: "cubic-bezier(0.175, 0.885, 0.32, 2.2)",
      }}
    >
      {children}
    </div>
  </GlassEffect>
);

export const GlassFilter: React.FC = () => null;

export const Component = () => {
  const dockIcons: DockIcon[] = [
    { icon: Home, alt: "Home" },
    { icon: Rocket, alt: "Services" },
    { icon: Briefcase, alt: "Work" },
    { icon: Newspaper, alt: "Blog" },
    { icon: Bot, alt: "AI" },
    { icon: Mail, alt: "Contact" },
  ];

  return (
    <div
      className="relative flex min-h-screen h-full w-full items-center justify-center overflow-hidden font-light"
      style={{
        background:
          'linear-gradient(rgba(15,23,42,0.25), rgba(15,23,42,0.45)), url("https://images.unsplash.com/photo-1432251407527-504a6b4174a2?q=80&w=1480&auto=format&fit=crop") center center / cover',
        animation: "moveBackground 60s linear infinite",
      }}
    >
      <GlassFilter />

      <div className="flex w-full flex-col items-center justify-center gap-6">
        <GlassDock icons={dockIcons} href="https://jantrasoft.online" />

        <GlassButton href="https://jantrasoft.online/contact">
          <div className="text-xl text-white">
            <p>How can we help you today?</p>
          </div>
        </GlassButton>
      </div>
    </div>
  );
};
