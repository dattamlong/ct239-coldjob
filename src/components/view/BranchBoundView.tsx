'use client';

import { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import { branchAndBound } from '@/algo/BranchAndBound';

interface Props {
  costMatrix: number[][];
}

export default function BranchBoundView({ costMatrix }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [optimalCost, setOptimalCost] = useState<number | null>(null);
  const [assignment, setAssignment] = useState<
    { worker: number; job: number }[] | null
  >(null);

  useEffect(() => {
    const { nodes, edges, optimalCost, tracePath } = branchAndBound(costMatrix);
    setNodes(nodes);
    setEdges(edges);
    setOptimalCost(optimalCost);
    setAssignment(tracePath()); // Truy vết kết quả
  }, [costMatrix]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">
        Kết quả phân công nhánh cận
      </h2>

      {/* Hiển thị cây nhánh cận */}
      <div className="bg-white p-4 border rounded-md shadow h-[1000px]">
        <ReactFlow
          className="floatingedges"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Hiển thị kết quả tối ưu */}
      <div className="mt-6 p-6 bg-gray-100 border rounded-lg shadow-sm max-w-4xl mx-auto">
        <h2 className="font-bold text-xl text-gray-800">Kết quả phân công:</h2>
        {optimalCost !== null && assignment ? (
          <>
            <ul className="mt-4 space-y-2 text-gray-700">
              {assignment.map(({ worker, job }) => (
                <li key={`${worker}-${job}`}>
                  Nhân viên {worker + 1} được phân công Công việc {job + 1}
                </li>
              ))}
            </ul>
            <div className="mt-4 font-bold text-lg text-gray-800">
              Tổng chi phí:{' '}
              <span className="text-green-600">{optimalCost}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-500 mt-2">Đang xử lý... Vui lòng đợi.</p>
        )}
      </div>
    </div>
  );
}
