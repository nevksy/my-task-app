import { ListTodo, StickyNote } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NoteForm } from './components/notes/NoteForm';
import { NoteList } from './components/notes/NoteList';
import { SearchBar } from './components/SearchBar';
import { TagFilter } from './components/tasks/TagFilter';
import { TaskForm } from './components/tasks/TaskForm';
import { TaskList } from './components/tasks/TaskList';
import { useNotes } from './hooks/useNotes';
import { useTasks } from './hooks/useTasks';
import type { Tag } from './types';
import { matchesQuery } from './utils/search';

function App() {
  const { tasks, addTask, toggleTask, setTaskTag, deleteTask } = useTasks();
  const { notes, addNote, deleteNote } = useNotes();
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<Tag | null>(null);

  const isSearching = query.trim() !== '';
  const isFilteringTasks = isSearching || tagFilter !== null;

  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (!isSearching || matchesQuery(task.title, query)) &&
          (tagFilter === null || task.tag === tagFilter),
      ),
    [tasks, query, isSearching, tagFilter],
  );
  const filteredNotes = useMemo(
    () => (isSearching ? notes.filter((note) => matchesQuery(note.content, query)) : notes),
    [notes, query, isSearching],
  );

  return (
    <div className="min-h-svh bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Task &amp; Note Manager</h1>
          <SearchBar value={query} onChange={setQuery} />
        </header>

        <main className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <ListTodo className="size-4" aria-hidden="true" />
              Tasks
            </h2>
            <TaskForm onAdd={addTask} />
            <TagFilter selected={tagFilter} onChange={setTagFilter} />
            <TaskList
              tasks={filteredTasks}
              hasAnyTasks={tasks.length > 0}
              isFiltering={isFilteringTasks}
              onToggle={toggleTask}
              onSetTag={setTaskTag}
              onDelete={deleteTask}
            />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <StickyNote className="size-4" aria-hidden="true" />
              Notes
            </h2>
            <NoteForm onAdd={addNote} />
            <NoteList
              notes={filteredNotes}
              hasAnyNotes={notes.length > 0}
              isSearching={isSearching}
              onDelete={deleteNote}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
