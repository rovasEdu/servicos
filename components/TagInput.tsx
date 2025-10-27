import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (newTags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !tags.includes(newTag)) {
      onTagsChange([...tags, newTag]);
    }
    setInputValue('');
    setTagToDelete(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent the main form from being submitted when a tag is added.
      e.preventDefault();
      addTag();
    }
  };

  const handleTagClick = (tag: string) => {
    if (tagToDelete === tag) {
      // Second click: delete it
      onTagsChange(tags.filter(t => t !== tag));
      setTagToDelete(null);
    } else {
      // First click: mark for deletion
      setTagToDelete(tag);
    }
  };

  // Clear deletion state when clicking outside the tags
  const handleContainerClick = () => {
    setTagToDelete(null);
  };

  const handleBlur = () => {
    // Add tag if there is text in the input when it loses focus
    if (inputValue.trim()) {
        addTag();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" onClick={handleContainerClick}>
      {tags.map(tag => (
        <span
          key={tag}
          onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}
          className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
            tagToDelete === tag
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
          }`}
        >
          {tag}
        </span>
      ))}
      <div className="flex-grow">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
              setInputValue(e.target.value);
              if (tagToDelete) setTagToDelete(null);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setTagToDelete(null)}
          onBlur={handleBlur}
          placeholder={placeholder || 'Adicionar...'}
          className="w-full bg-transparent outline-none p-1 text-sm"
        />
      </div>
    </div>
  );
};

export default TagInput;