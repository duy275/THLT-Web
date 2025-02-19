import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const categories = {
	React: 'border-blue-500',
	Python: 'border-yellow-500',
	Maths: 'border-green-500',
	Science: 'border-red-500',
	JS: 'border-orange-500',
	Dinner: 'border-purple-500',
	Project: 'border-pink-500',
	Cricket: 'border-yellow-500',
};

export default function TodoList() {
	const [tasks, setTasks] = useState([
		{ category: 'React', description: 'Learn all basic concepts of react' },
		{ category: 'Python', description: 'Debugging in python project' },
		{ category: 'Maths', description: 'Learn and practice some concepts of maths' },
		{ category: 'Science', description: 'Science study' },
		{ category: 'JS', description: 'Learn basic concepts of javascript' },
		{ category: 'Dinner', description: 'Do dinner' },
		{ category: 'Project', description: 'Make a small project of react' },
		{ category: 'Cricket', description: 'Play cricket with friends' },
	]);
	const [newTask, setNewTask] = useState({ category: '', description: '' });

	const addTask = () => {
		if (newTask.category && newTask.description) {
			setTasks([...tasks, newTask]);
			setNewTask({ category: '', description: '' });
		}
	};

	const deleteTask = (index) => {
		setTasks(tasks.filter((_, i) => i !== index));
	};

	return (
		<div className='p-8 bg-gray-100 min-h-screen'>
			<h1 className='text-3xl font-bold text-center mb-6'>Todo List</h1>
			<div className='flex justify-center mb-6'>
				<input
					placeholder='Category'
					value={newTask.category}
					onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
					className='mr-2 border p-2 rounded'
				/>
				<input
					placeholder='Task description'
					value={newTask.description}
					onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
					className='mr-2 border p-2 rounded'
				/>
				<button onClick={addTask} className='bg-blue-500 text-white px-4 py-2 rounded'>
					Create Task
				</button>
			</div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
				{tasks.map((task, index) => (
					<div key={index} className={`border-2 p-4 rounded-lg ${categories[task.category] || 'border-gray-500'}`}>
						<h2 className='font-bold text-lg'>{task.category}</h2>
						<p className='text-gray-600'>{task.description}</p>
						<div className='flex justify-end mt-2'>
							<button onClick={() => deleteTask(index)} className='text-red-500'>
								<Trash2 />
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
