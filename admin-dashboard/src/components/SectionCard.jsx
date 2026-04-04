"use client";
import { useState } from "react";
import { IconChevronDown, IconEdit, IconTrash } from "@/components/Icons";

function DragHandle() {
  return (
    <svg className="w-4 h-4 text-text-muted cursor-grab active:cursor-grabbing" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

export default function SectionCard({
  title,
  description,
  icon,
  children,
  defaultOpen = false,
  dragHandlers = {},
  isDragging = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`bg-card-bg border rounded-2xl transition-all duration-200 ${
        isDragging
          ? "border-red-brand shadow-lg shadow-red-brand/10 opacity-90 scale-[1.01]"
          : "border-card-border hover:border-card-border/80"
      }`}
      {...dragHandlers}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Drag Handle */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
          {...(dragHandlers.draggable ? { draggable: true } : {})}
        >
          <DragHandle />
        </div>

        {/* Icon */}
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-red-brand/10 flex items-center justify-center shrink-0">
            <span className="text-sm">{icon}</span>
          </div>
        )}

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary m-0">{title}</h3>
          {description && (
            <p className="text-[0.65rem] text-text-muted m-0 mt-0.5">{description}</p>
          )}
        </div>

        {/* Toggle Arrow */}
        <IconChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-0 border-t border-card-border/50">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}
