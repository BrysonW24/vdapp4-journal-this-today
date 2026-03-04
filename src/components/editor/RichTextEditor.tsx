'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Link2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InputDialog } from '@/components/ui/input-dialog';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[250px] sm:min-h-[400px] px-4 py-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = (url: string) => {
    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  const ToolbarButton = ({ onClick, isActive, label, children }: { onClick: () => void; isActive?: boolean; label: string; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors flex-shrink-0 active:scale-95 ${
        isActive ? 'bg-zen-sage-soft dark:bg-zen-sage/20 text-zen-sage dark:text-zen-sage-light' : 'text-zen-forest dark:text-zen-stone'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border overflow-hidden">
      {/* Primary Toolbar */}
      <div className="border-b border-zen-sand dark:border-zen-night-border p-1.5 sm:p-2 flex flex-wrap items-center gap-0.5 bg-zen-cream dark:bg-zen-night-surface">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} label="Bold">
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} label="Italic">
          <Italic size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-zen-sand dark:bg-zen-night-border mx-0.5 flex-shrink-0 self-center" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} label="Heading">
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} label="Bullet list">
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} label="Numbered list">
          <ListOrdered size={18} />
        </ToolbarButton>

        <div className="w-px h-6 bg-zen-sand dark:bg-zen-night-border mx-0.5 flex-shrink-0 self-center" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} label="Highlight">
          <Highlighter size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setLinkDialogOpen(true)} isActive={editor.isActive('link')} label="Add link">
          <Link2 size={18} />
        </ToolbarButton>

        {/* Expand/collapse toggle */}
        <div className="ml-auto">
          <button
            onClick={() => setShowMore(!showMore)}
            aria-label={showMore ? 'Hide more tools' : 'Show more tools'}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors text-zen-moss/50 dark:text-zen-stone/50"
          >
            {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Secondary Toolbar — collapsible */}
      {showMore && (
        <div className="border-b border-zen-sand dark:border-zen-night-border p-1.5 sm:p-2 flex flex-wrap items-center gap-0.5 bg-zen-cream/60 dark:bg-zen-night-surface/60">
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} label="Strikethrough">
            <Strikethrough size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} label="Heading 1">
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} label="Heading 3">
            <Heading3 size={18} />
          </ToolbarButton>

          <div className="w-px h-6 bg-zen-sand dark:bg-zen-night-border mx-0.5 flex-shrink-0 self-center" />

          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} label="Align left">
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} label="Align center">
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} label="Align right">
            <AlignRight size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} label="Justify">
            <AlignJustify size={18} />
          </ToolbarButton>

          <div className="w-px h-6 bg-zen-sand dark:bg-zen-night-border mx-0.5 flex-shrink-0 self-center" />

          <ToolbarButton onClick={() => setImageDialogOpen(true)} label="Add image">
            <ImageIcon size={18} />
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Dialogs */}
      <InputDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        title="Add Link"
        description="Enter the URL for the link."
        placeholder="https://example.com"
        confirmLabel="Add Link"
        onConfirm={addLink}
      />
      <InputDialog
        open={imageDialogOpen}
        onOpenChange={setImageDialogOpen}
        title="Add Image"
        description="Enter the URL of the image."
        placeholder="https://example.com/image.jpg"
        confirmLabel="Add Image"
        onConfirm={addImage}
      />
    </div>
  );
}
