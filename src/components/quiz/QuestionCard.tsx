import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Question, Option } from '../../types/quiz';
import { Heading } from '../catalyst/heading';
import { Text } from '../catalyst/text';
import { Bars3Icon } from '@heroicons/react/24/outline'; // Use Bars3Icon from outline
import { XMarkIcon } from '@heroicons/react/20/solid'; // Import XMarkIcon
import { Button } from '../catalyst/button'; // Import Button

interface QuestionCardProps {
  question: Question;
  selectedOptionIds: string[]; // Ordered array of selected IDs for THIS question
  onToggleAnswer: (questionId: number, optionId: string) => void;
  onReorderAnswers: (questionId: number, orderedOptionIds: string[]) => void; // Renamed prop
}

interface SortableOptionProps {
  id: string;
  option: Option;
  priority: number;
  onToggle: () => void;
}

// Inner component for a single draggable/sortable selected option
const SortableOption: React.FC<SortableOptionProps> = ({ id, option, priority, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border border-indigo-200 dark:border-indigo-800 rounded-md bg-indigo-50 dark:bg-indigo-900/30 mb-2 shadow-sm"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="cursor-grab touch-none p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {/* Priority Badge */}
      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-600 text-white text-xs font-bold rounded-full">
        {priority}
      </span>

      {/* Option Text (No longer clickable) */}
      <span className="flex-grow text-gray-800 dark:text-white text-base mr-2"> {/* Added margin */}
        {option.text}
      </span>
      
      {/* Remove Button */}
      <Button 
        plain 
        aria-label="Remove selection"
        onClick={onToggle} // Attach toggle handler here
        className="ml-auto flex-shrink-0 p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
          <XMarkIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};


const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionIds,
  onToggleAnswer,
  onReorderAnswers,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Find the full Option objects for selected IDs, maintaining order
  const selectedOptions = selectedOptionIds
    .map(id => question.options.find(opt => opt.id === id))
    .filter((opt): opt is Option => opt !== undefined); // Type guard

  // Find unselected options
  const unselectedOptions = question.options.filter(
    option => !selectedOptionIds.includes(option.id)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = selectedOptionIds.indexOf(String(active.id));
      const newIndex = selectedOptionIds.indexOf(String(over.id));

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedIds = arrayMove(selectedOptionIds, oldIndex, newIndex);
        onReorderAnswers(question.id, reorderedIds);
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-3xl mx-auto">
      <Heading level={2} className="mb-6 text-center">
        {question.question}
      </Heading>

      {/* Selected & Prioritized Options (Draggable) */}
      {selectedOptions.length > 0 && (
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
          <Text className="text-lg font-medium mb-3">Your prioritized selections (drag to reorder):</Text>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedOptionIds} // Use the array of IDs
              strategy={verticalListSortingStrategy}
            >
              {selectedOptions.map((option, index) => (
                <SortableOption
                  key={option.id}
                  id={option.id}
                  option={option}
                  priority={index + 1} // 1-based priority
                  onToggle={() => onToggleAnswer(question.id, option.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Unselected Options (Clickable to Select) */}
      {unselectedOptions.length > 0 && (
         <div className="mb-4">
             <Text className="text-lg font-medium mb-3">Select additional options:</Text>
             <div className="space-y-3">
                 {unselectedOptions.map((option) => (
                 <div
                     key={option.id}
                     className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                     onClick={() => onToggleAnswer(question.id, option.id)}
                 >
                     {/* Simple Checkbox Indicator */}
                     <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                      {/* Could add a plus icon or similar */}
                     </div>
                     <span className="text-gray-800 dark:text-white text-base">
                     {option.text}
                     </span>
                 </div>
                 ))}
             </div>
         </div>
      )}

      {/* Handle case where all options might be selected */}
       {selectedOptions.length > 0 && unselectedOptions.length === 0 && (
         <Text className="text-center italic text-gray-500 dark:text-gray-400 mt-4">
             All options selected. Drag above to set priority.
         </Text>
       )}
    </div>
  );
};

export default QuestionCard;