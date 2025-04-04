import prisma from "../../prisma-client";

export default async function Home() {
  // const [tasks, setTask] = useState()
  const task = await prisma.task.findUnique({
    where: { id: 1 },
  });
  return <div>Task title is {task?.title}</div>;
}
