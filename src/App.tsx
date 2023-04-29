import React, {
  FormEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
  useRef,
  LegacyRef,
  RefObject,
} from "react";
import "./main.css";

type logRecord = { description: string; spentTime: number; closed: boolean };

const hoursMinutesFromSeconds = (seconds: number) => {
  let hou: string = String(Math.trunc(seconds / 3600)).padStart(2, "0");
  let min: string = String(Math.trunc((seconds / 60) % 60)).padStart(2, "0");
  let sec: string = String(seconds % 60).padStart(2, "0");
  return `${hou}:${min}:${sec}`;
};

function LogItem({
  record,
  index,
  chosenOne,
}: {
  record: logRecord;
  index: number;
  chosenOne: boolean;
}) {
  return (
    <li
      className={`log-record${chosenOne ? " checked" : ""}`}
      data-index={index}>
      <span className={`description${record.closed ? " closed" : ""}`}>
        Task: {record.description}
      </span>
      <span className="time-spent">
        Spent time: {hoursMinutesFromSeconds(record.spentTime)}
      </span>
    </li>
  );
}

function TaskInput({ handler }: { handler: FormEventHandler }) {
  let input:RefObject<HTMLInputElement> = useRef(null)
  useEffect(()=>{
    let link = document.querySelector('#task-input')
    if(input.current)
      input.current.focus()
  },[])
  return (
    <form className="task-form" onSubmit={handler}>
      <input ref={input} type="text" id="task-input" placeholder="Enter task, please..."/>
      <button className="button confirm">Confirm</button>
    </form>
  );
}

function Results() {
  return <div className="results"></div>;
}

function WorkingModal({
  description,
  pauseTaskHandler,
}: {
  description: string;
  pauseTaskHandler: MouseEventHandler;
}) {
  return (
    <div className="working">
      <span className="description">{`Working on ${description} task.`}</span>
      <button className="button" onClick={pauseTaskHandler}>
        Pause task
      </button>
    </div>
  );
}

function TimeManagementApp() {
  let [logItems, setlogItems]: [logRecord[], any] = useState([]);
  let [modalVisible, setModalVisible]: [boolean, any] = useState(false);
  let [chosenOne, setChosenOne]: [number, any] = useState(0);
  let [modalComponent, setModalComponent]: [React.FC | null, any] =
    useState(null);

  useEffect(() => {
    if (
      logItems.length === 0 &&
      window.localStorage.getItem("logItems") !== null
    )
      setlogItems(JSON.parse(window.localStorage.getItem("logItems") ?? "[]"));
  }, []);

  useEffect(() => {
    if (logItems.length !== 0)
      window.localStorage.setItem("logItems", JSON.stringify(logItems));
  }, [logItems]);

  const addTimetoLogItem = (prevDate: number) => {
    let calculatedTime: number = Math.trunc((Date.now() - prevDate) / 1000);
    let result = logItems.slice();
    result[chosenOne].spentTime += calculatedTime;
    return result;
  };

  const createTaskHandler = (prevDate: number) => {
    const pauseTaskHandler: MouseEventHandler = () => {
      setlogItems(addTimetoLogItem(prevDate));
      setModalVisible(false);
    };
    return pauseTaskHandler;
  };

  const closeTaskHandler: MouseEventHandler = () => {
    if (logItems.length === 0 || !logItems[chosenOne]) return undefined;
    let mutable = logItems.slice();
    mutable[chosenOne].closed = true;
    setlogItems(mutable);
  };

  const startTaskHandler: MouseEventHandler = () => {
    if (!logItems[chosenOne] || logItems[chosenOne].closed) return undefined;
    setModalComponent(
      <WorkingModal
        description={logItems[chosenOne].description}
        pauseTaskHandler={createTaskHandler(Date.now())}
      />
    );
    setModalVisible(true);
  };

  const submitHandler: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    let target = event.target as HTMLElement;
    let input = target.childNodes[0] as HTMLInputElement;
    setlogItems([
      ...logItems,
      { description: input.value, spentTime: 0, closed: false },
    ]);
    setModalVisible(false);
  };

  const chooseTaskHandler: MouseEventHandler = (event) => {
    let target = event.target as HTMLElement;
    if (!target.closest(".log-record")) return undefined;
    let record = target.closest(".log-record") as HTMLLIElement;
    setChosenOne(Number(record.dataset.index));
  };

  const removeTaskHandler: MouseEventHandler = (event) => {
    if (logItems.length === 0 || !logItems[chosenOne]) return undefined;
    let mutable = logItems.slice();
    mutable.splice(chosenOne, 1);
    setlogItems(mutable);
  };

  const showModalForm = () => {
    setModalVisible(true);
    setModalComponent(<TaskInput handler={submitHandler} />);
  };

  return (
    <div className="time-management-app">
      <ul className="log" onClick={chooseTaskHandler}>
        {logItems.map((record, i) => (
          <LogItem
            record={record}
            index={i}
            key={i}
            chosenOne={chosenOne === i}></LogItem>
        ))}
      </ul>
      <div className="buttons-container">
        <button className="button" onClick={closeTaskHandler}>
          Close task
        </button>

        <button className="button" onClick={startTaskHandler}>
          Start Task
        </button>
        <button className="button" onClick={showModalForm}>
          Add new task
        </button>
        <button className="button" onClick={removeTaskHandler}>
          Remove task
        </button>
      </div>
      {modalVisible ? (
        <div className="modal-container">{modalComponent}</div>
      ) : (
        ""
      )}
    </div>
  );
}

function App() {
  return <TimeManagementApp />;
}

export default App;
