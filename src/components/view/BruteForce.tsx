import { Matrix } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// Utility function to generate permutations
export function generatePermutations<T>(array: T[]): T[][] {
  if (array.length === 0) return [[]];
  return array.flatMap((val, i) =>
    generatePermutations(array.filter((_, index) => index !== i)).map(
      (perm) => [val, ...perm]
    )
  );
}

// Custom hook
export function useJobAssignment(costMatrix: number[][]) {
  const [permutations, setPermutations] = useState<number[][]>([]);
  const [bestResult, setBestResult] = useState<{
    assignment: { worker: number; job: number; cost: number }[];
    totalCost: number;
  } | null>(null);

  useEffect(() => {
    // Generate permutations for job assignments
    const jobs = Array.from({ length: costMatrix.length }, (_, i) => i);
    const generatedPermutations = generatePermutations(jobs);
    setPermutations(generatedPermutations);

    // Find the best assignment with minimum cost
    let minCost = Infinity;
    let bestAssignment: { worker: number; job: number; cost: number }[] = [];

    generatedPermutations.forEach((assignment) => {
      const totalCost = assignment.reduce(
        (acc, job, worker) => acc + costMatrix[worker][job],
        0
      );
      if (totalCost < minCost) {
        minCost = totalCost;
        bestAssignment = assignment.map((job, worker) => ({
          worker,
          job,
          cost: costMatrix[worker][job],
        }));
      }
    });

    setBestResult({ assignment: bestAssignment, totalCost: minCost });
  }, [costMatrix]);

  return { permutations, bestResult };
}

interface Props {
  costMatrix: Matrix;
}

interface Props {
  costMatrix: number[][];
}

export default function BruteForceView({ costMatrix }: Props) {
  const { permutations, bestResult } = useJobAssignment(costMatrix);

  const [renderedPermutations, setRenderedPermutations] = useState<number[][]>(
    []
  );
  const [currentBatch, setCurrentBatch] = useState(1);
  const assignmentsPerPage = 10; // Hiển thị 10 kết quả mỗi lần

  // Hàm xử lý khi bấm nút "Xem thêm"
  const handleLoadMore = () => {
    const startIndex = (currentBatch - 1) * assignmentsPerPage;
    const endIndex = startIndex + assignmentsPerPage;

    // Thêm các hoán vị mới vào danh sách đã render
    setRenderedPermutations((prev) => [
      ...prev,
      ...permutations.slice(startIndex, endIndex),
    ]);

    // Tăng batch
    setCurrentBatch((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kết quả phân công công việc</h2>
        <span className="text-gray-600">
          Hiển thị {renderedPermutations.length} / {permutations.length} hoán vị
        </span>
      </div>

      <div className="space-y-6">
        {renderedPermutations.map((assignment, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-primary mb-4">
              Hoán vị #{index + 1}
            </h3>

            <div className="space-y-2">
              {assignment.map((job, worker) => (
                <div
                  key={worker}
                  className="flex justify-between border-b pb-2"
                >
                  <span className="text-gray-700 font-medium">
                    Công nhân {worker + 1}
                  </span>
                  <span className="text-gray-700 font-medium">
                    → Công việc {job + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <span className="text-xl font-bold text-green-600">
                Tổng chi phí:{' '}
                {assignment.reduce(
                  (acc, job, worker) => acc + costMatrix[worker][job],
                  0
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {renderedPermutations.length < permutations.length && (
        <div className="flex justify-center mt-6">
          <Button
            className="px-6 py-2 bg-primary text-white rounded-md"
            onClick={handleLoadMore}
          >
            Xem thêm
          </Button>
        </div>
      )}

      {/* Hiển thị kết quả tốt nhất */}
      <div className="mt-6 p-6 bg-gray-100 border rounded-lg shadow-sm max-w-[1000px] mx-auto">
        <h2 className="font-bold text-xl text-gray-800">Kết quả phân công:</h2>
        {bestResult ? (
          <>
            <ul className="mt-4 space-y-2 text-gray-700">
              {bestResult.assignment.map(({ worker, job, cost }) => (
                <li key={worker}>
                  Nhân viên {worker + 1} được phân công Công việc {job + 1} với
                  chi phí{' '}
                  <span className="font-medium text-green-600">{cost}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 font-bold text-lg text-gray-800">
              Tổng chi phí:{' '}
              <span className="text-blue-600">{bestResult.totalCost}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-2">
            Chưa có kết quả. Hãy nhấn Bắt đầu để bắt đầu phân công.
          </p>
        )}
      </div>
    </div>
  );
}
