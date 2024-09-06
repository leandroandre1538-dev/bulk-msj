import { useEffect } from "react";
import { useTask } from "../context/TaskContext.jsx"
import TaskCard from "../components/TaskCard.jsx";

function TaskPage() {
    const { getTasks, tasks } = useTask();

    useEffect(() => {
        getTasks();
    }, []);

    if (tasks.length == 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="bg-[#141414] w-full max-w-7xl p-6 rounded-lg shadow-lg">
                    <h1 className="text-3xl text-center font-bold mb-8">
                        Página de tareas
                    </h1>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
                        <div className="bg-[#ffffff] p-6 rounded-lg shadow-md transform transition duration-300 hover:scale-105 hover:shadow-lg">
                            <h2 className="text-xl font-semibold mb-2 text-gray-800">No tiene tareas</h2>
                            <p className="text-[#16181C] mb-4">-</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full items-center justify-center">
            <div className="bg-[#141414] w-full max-w-7xl p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl text-center font-bold mb-8">
                    Página de tareas
                </h1>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
                    {tasks.map((task) => (
                        <TaskCard task={task} key={task._id} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TaskPage