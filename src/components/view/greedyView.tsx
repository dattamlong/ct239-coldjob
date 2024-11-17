import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Matrix } from '@/types';

interface Props {
  costMatrix: Matrix;
}

const GreedyView: React.FC<Props> = ({ costMatrix }) => {
  const [mode, setMode] = useState<'worker' | 'job'>('worker');
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [activeCol, setActiveCol] = useState<number | null>(null);
  const [assignedJobs, setAssignedJobs] = useState<{ [key: number]: number }>(
    {}
  );
  const [result, setResult] = useState<
    { worker: number; job: number; cost: number }[]
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [delayMs, setDelayMs] = useState(400);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleStart = async () => {
    setAssignedJobs({});
    setResult([]);
    setActiveRow(null);
    setActiveCol(null);
    setIsRunning(true);

    const tempAssignedJobs: { [key: number]: number } = {};
    const tempResult: { worker: number; job: number; cost: number }[] = [];

    if (mode === 'worker') {
      for (let worker = 0; worker < costMatrix.length; worker++) {
        setActiveRow(worker);
        let minCost = Infinity;
        let selectedJob = -1;

        for (let job = 0; job < costMatrix[worker].length; job++) {
          if (
            !Object.values(tempAssignedJobs).includes(job) &&
            costMatrix[worker][job] < minCost
          ) {
            minCost = costMatrix[worker][job];
            selectedJob = job;
          }
          setActiveCol(job);
          await delay(delayMs); // Áp dụng độ trễ người dùng đã chọn
        }

        if (selectedJob !== -1) {
          tempAssignedJobs[worker] = selectedJob;
          tempResult.push({
            worker,
            job: selectedJob,
            cost: costMatrix[worker][selectedJob],
          });
          setAssignedJobs({ ...tempAssignedJobs });
          await delay(delayMs);
        }
      }
    } else {
      for (let job = 0; job < costMatrix[0].length; job++) {
        setActiveCol(job);
        let minCost = Infinity;
        let selectedWorker = -1;

        for (let worker = 0; worker < costMatrix.length; worker++) {
          if (
            !Object.keys(tempAssignedJobs).includes(worker.toString()) &&
            costMatrix[worker][job] < minCost
          ) {
            minCost = costMatrix[worker][job];
            selectedWorker = worker;
          }
          setActiveRow(worker);
          await delay(delayMs); // Áp dụng độ trễ người dùng đã chọn
        }

        if (selectedWorker !== -1) {
          tempAssignedJobs[selectedWorker] = job;
          tempResult.push({
            worker: selectedWorker,
            job: job,
            cost: costMatrix[selectedWorker][job],
          });
          setAssignedJobs({ ...tempAssignedJobs });
          await delay(delayMs); // Đổi màu ngay sau khi hoàn thành 1 cột
        }
      }
    }

    setResult(tempResult);
    setActiveRow(null);
    setActiveCol(null);
    setIsRunning(false);
  };

  const handleReset = () => {
    setAssignedJobs({});
    setResult([]);
    setActiveRow(null);
    setActiveCol(null);
    setIsRunning(false);
  };

  const totalCost = result.reduce((sum, { cost }) => sum + cost, 0);

  return (
    <div className="space-y-8 mx-auto px-4">
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-center text-gray-800">
        Phân công công việc
      </h1>

      {/* Mode Selector */}
      <div className="flex justify-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="worker"
            checked={mode === 'worker'}
            onChange={() => setMode('worker')}
            className="h-4 w-4"
          />
          <span className="text-gray-700 font-medium">
            Duyệt theo nhân viên
          </span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="job"
            checked={mode === 'job'}
            onChange={() => setMode('job')}
            className="h-4 w-4"
          />
          <span className="text-gray-700 font-medium">
            Duyệt theo công việc
          </span>
        </label>
      </div>

      {/* Delay Input */}
      <div className="flex items-center justify-center space-x-4">
        <label className="font-medium text-gray-700">Độ trễ (ms):</label>
        <Input
          defaultValue={delayMs}
          type="number"
          onChange={(e) => {
            setDelayMs(e.target.valueAsNumber || 0);
          }}
          className="w-24 text-center"
          disabled={isRunning}
          min={0}
          max={1000}
        />
      </div>

      {/* Matrix */}
      <div className="rounded-lg shadow-lg p-6 bg-white border">
        <div className="overflow-x-auto overflow-y-auto max-h-[80vh]">
          <div className="grid gap-4">
            {/* Header */}
            <div
              className={`grid ${
                costMatrix[0].length > 5
                  ? `grid-cols-[auto_repeat(${costMatrix[0].length},minmax(100px,1fr))]`
                  : 'grid-cols-5'
              } gap-2`}
            >
              <div></div>
              {costMatrix[0].map((_, job) => (
                <div
                  key={job}
                  className="font-semibold text-center text-gray-600 bg-gray-200 p-2 rounded-lg shadow-sm"
                >
                  Công việc {job + 1}
                </div>
              ))}
            </div>

            {/* Rows */}
            {costMatrix.map((row, worker) => (
              <div
                key={worker}
                className={`grid ${
                  row.length > 5
                    ? `grid-cols-[auto_repeat(${row.length},minmax(100px,1fr))]`
                    : 'grid-cols-5'
                } gap-2 items-center`}
              >
                <div className="font-medium text-gray-700 text-right pr-2">
                  Nhân viên {worker + 1}
                </div>
                {row.map((cost, job) => {
                  const isSelected = assignedJobs[worker] === job;
                  const isActive = activeRow === worker && activeCol === job;

                  return (
                    <div
                      key={job}
                      className={`p-3 text-center border rounded-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold shadow-md'
                          : isActive
                            ? 'bg-blue-300 text-white font-medium'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cost}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          className="px-6 py-2 text-lg font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={handleStart}
          disabled={isRunning}
        >
          Bắt đầu
        </Button>
        <Button
          className="px-6 py-2 text-lg font-semibold bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
          onClick={handleReset}
          disabled={isRunning}
        >
          Reset
        </Button>
      </div>

      {/* Results */}
      <div className="mt-6 p-6 bg-gray-100 border rounded-lg shadow-sm">
        <h2 className="font-bold text-xl text-gray-800">Kết quả phân công:</h2>
        {result.length > 0 ? (
          <>
            <ul className="mt-4 space-y-2 text-gray-700">
              {result.map(({ worker, job, cost }) => (
                <li key={worker}>
                  Nhân viên {worker + 1} được phân công Công việc {job + 1} với
                  chi phí{' '}
                  <span className="font-medium text-green-600">{cost}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 font-bold text-lg text-gray-800">
              Tổng chi phí: <span className="text-blue-600">{totalCost}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-2">
            Chưa có kết quả. Hãy nhấn "Bắt đầu" để bắt đầu phân công.
          </p>
        )}
      </div>
    </div>
  );
};

export default GreedyView;
