'use client';

import { MatrixDropzone } from '@/components/ui/matrixDropzone';
import { useState } from 'react';
import { Algo, Matrix } from '@/types';
import GreedyView from '@/components/view/greedyView';

export default function Home() {
  const [matrix, setMatrix] = useState<Matrix>([]);
  const [algo, setAlgo] = useState<Algo>(Algo.Greedy);
  const [isRun, setIsRun] = useState(false);

  return (
    <div>
      <div className="bg-primary">
        <div className="max-w-[1000px] mx-auto space-y-2 p-4">
          <MatrixDropzone
            setMatrix={setMatrix}
            matrix={matrix}
            setAlgo={setAlgo}
            algo={algo}
            onRun={() => setIsRun(true)}
          />
        </div>
      </div>
      <div className="mx-auto py-6">
        {isRun && algo === Algo.Greedy && matrix.length ? (
          <GreedyView costMatrix={matrix} />
        ) : null}
      </div>
    </div>
  );
}
