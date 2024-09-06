import { useForm } from "react-hook-form"
import { useTask } from "../context/TaskContext";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

function TaskFormPage() {

    const { register, handleSubmit, setValue } = useForm();
    const { createTask, getTask, updateTask } = useTask();
    const navigate = useNavigate();
    const params = useParams();

    useEffect(() => {
        async function loadTask() {
            if (params.id) {
                const task = await getTask(params.id);
                setValue('title', task.title);
                setValue('description', task.description);
                setValue('date', dayjs(task.date).utc().format('YYYY/MM/DD'))
            }
        }
        loadTask();
    }, []);

    const onSubmit = handleSubmit((data) => {
        const dataValid = {
            ...data,
            date: data.date ? dayjs.utc(data.date).format() : dayjs.utc().format(),
        };

        if (params.id) {
            updateTask(params.id, dataValid);
        } else {
            createTask(dataValid);
        }
        navigate('/tasks');
    });

    return (
        <div className="flex h-full items-center justify-center">
            <div className="bg-[#141414] max-w-md w-full p-10 rounded-lg">
                <h1 className="text-2xl text-center font-bold mb-4">
                    Crea una nueva tarea
                </h1>
                <form onSubmit={onSubmit} className="flex flex-col gap-2">
                    <label htmlFor="title" className="text-base text-[#DFEBF2] font-bold px-2 rounded-md">Título</label>
                    <input
                        type="text"
                        {...register('title', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Título de la tarea"
                        autoFocus
                    />
                    <label htmlFor="title" className="text-base text-[#DFEBF2] font-bold px-2 rounded-md">Descripción</label>
                    <textarea
                        rows="3"
                        {...register('description', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Descripción"
                    />
                    <label htmlFor="title" className="text-base text-[#DFEBF2] font-bold px-2 rounded-md">Fecha</label>
                    <input
                        type="date"
                        {...register('date')}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                    />
                    <button
                        type="submit"
                        className="bg-[#6D28D9] hover:bg-[#5B21B6] text-slate-100 px-4 py-2 rounded-md my-2 shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                    >
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    )
};

export default TaskFormPage