"use client";
import { useRef, useEffect, useCallback } from "react";

const TOOLBAR_BUTTONS = [
  { cmd: "bold", icon: "B", title: "Bold", style: "font-bold" },
  { cmd: "italic", icon: "I", title: "Italic", style: "italic" },
  { cmd: "underline", icon: "U", title: "Underline", style: "underline" },
  { sep: true },
  { cmd: "insertOrderedList", icon: "1.", title: "Numbered List" },
  { cmd: "insertUnorderedList", icon: "•", title: "Bullet List" },
  { sep: true },
  { cmd: "justifyLeft", icon: "≡", title: "Rata Kiri" },
  { cmd: "justifyCenter", icon: "≡", title: "Rata Tengah" },
  { cmd: "justifyRight", icon: "≡", title: "Rata Kanan" },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = "120px" }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  // Set initial value only once on mount
  useEffect(() => {
    if (editorRef.current && value && !isInternalChange.current) {
      // Only set if editor is empty or content differs significantly
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === "<br>") {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  // When value changes externally (e.g. page switch), update editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
      // Reset flag after React processes the state update
      requestAnimationFrame(() => {
        isInternalChange.current = false;
      });
    }
  }, [onChange]);

  function execCmd(cmd) {
    document.execCommand(cmd, false, null);
    editorRef.current?.focus();
    handleInput();
  }

  function handleLinkInsert() {
    const url = prompt("Masukkan URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      editorRef.current?.focus();
      handleInput();
    }
  }

  const btnClass = "px-2 py-1 text-xs text-gray-400 bg-transparent border-none cursor-pointer hover:bg-white/10 hover:text-white rounded transition-colors";

  return (
    <div className="border border-input-border rounded-xl overflow-hidden bg-input-bg">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-input-border bg-card-alt-bg/50 flex-wrap">
        {TOOLBAR_BUTTONS.map((btn, i) =>
          btn.sep ? (
            <div key={i} className="w-px h-5 bg-input-border mx-1" />
          ) : (
            <button
              key={btn.cmd}
              type="button"
              onClick={() => execCmd(btn.cmd)}
              title={btn.title}
              className={`${btnClass} ${btn.style || ""}`}
            >
              {btn.icon}
            </button>
          )
        )}
        <div className="w-px h-5 bg-input-border mx-1" />
        <button type="button" onClick={handleLinkInsert} title="Insert Link" className={btnClass}>
          🔗
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        onInput={handleInput}
        data-placeholder={placeholder}
        className="px-3 py-2.5 text-sm text-white text-left focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-600 [&_a]:text-gold [&_a]:underline [&_ol]:list-decimal [&_ol]:ml-5 [&_ul]:list-disc [&_ul]:ml-5 [&_li]:py-0.5"
        style={{ minHeight, direction: "ltr", textAlign: "left", unicodeBidi: "plaintext" }}
      />
    </div>
  );
}
