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

  const ToolbarButton = ({ onClick, isActive, title, children }: { onClick: () => void; isActive?: boolean; title: string; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors flex-shrink-0 ${
        isActive ? 'bg-zen-sage-soft dark:bg-zen-sage/20 text-zen-sage dark:text-zen-sage-light' : 'text-zen-forest dark:text-zen-stone'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-zen-sand dark:border-zen-night-border p-2 sm:p-3 flex overflow-x-auto gap-0.5 bg-zen-cream dark:bg-zen-night-surface scrollbar-hide">
        {/* Text Formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={18} />
        </ToolbarButton>

        <div className="w-px h-8 bg-zen-sand dark:bg-zen-night-border mx-1 flex-shrink-0 self-center"></div>

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={18} />
        </ToolbarButton>

        <div className="w-px h-8 bg-zen-sand dark:bg-zen-night-border mx-1 flex-shrink-0 self-center"></div>

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={18} />
        </ToolbarButton>

        <div className="w-px h-8 bg-zen-sand dark:bg-zen-night-border mx-1 flex-shrink-0 self-center"></div>

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify size={18} />
        </ToolbarButton>

        <div className="w-px h-8 bg-zen-sand dark:bg-zen-night-border mx-1 flex-shrink-0 self-center"></div>

        {/* Highlight */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
          <Highlighter size={18} />
        </ToolbarButton>

        {/* Link */}
        <ToolbarButton onClick={() => setLinkDialogOpen(true)} isActive={editor.isActive('link')} title="Add Link">
          <Link2 size={18} />
        </ToolbarButton>

        {/* Image */}
        <ToolbarButton onClick={() => setImageDialogOpen(true)} title="Add Image">
          <ImageIcon size={18} />
        </ToolbarButton>
      </div>

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
