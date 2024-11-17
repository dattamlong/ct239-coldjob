import dagre from '@dagrejs/dagre';
import { v4 as uuidv4 } from 'uuid';

type Node = {
  id: string;
  jobNumber: number; // Công việc hiện tại
  workerNumber: number; // Nhân viên hiện tại
  parent?: Node; // Nút cha
  cost: number; // Chi phí của nút
  level: number; // Cấp độ trong cây
};

export function branchAndBound(costMatrix: number[][]) {
  const n = costMatrix.length;
  const minHeap: Node[] = []; // Min-heap quản lý các nút
  const edges: any[] = [];
  const nodes: any[] = [];

  let optimalCost = Infinity;
  let optimalNode: Node | null = null;

  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB' });

  const nodeWidth = 200;
  const nodeHeight = 50;

  // Thêm nút gốc (root) vào heap
  const rootNode: Node = {
    id: 'root',
    jobNumber: -1,
    workerNumber: -1,
    cost: 0,
    level: 0,
  };
  minHeap.push(rootNode);

  while (minHeap.length > 0) {
    // Lấy nút có chi phí nhỏ nhất (E)
    minHeap.sort((a, b) => a.cost - b.cost);
    const currentNode = minHeap.shift() as Node;

    // Cắt nhánh: nếu chi phí hiện tại >= chi phí tối ưu, bỏ qua nút này
    if (currentNode.cost >= optimalCost) {
      continue;
    }

    nodes.push({
      id: currentNode.id,
      data: {
        label: `
      Nhân viên: ${currentNode.workerNumber === -1 ? 'N/A' : currentNode.workerNumber + 1},
      Công việc: ${currentNode.jobNumber === -1 ? 'N/A' : currentNode.jobNumber + 1},
      Chi phí: ${currentNode.cost},
      Tầng: ${currentNode.level},
    `,
      },
      position: { x: 0, y: 0 },
      style: {
        backgroundColor: currentNode.level === n ? '#4ade80' : 'white',
      },
    });

    // Thêm cạnh vào danh sách
    if (currentNode.parent) {
      edges.push({
        id: `${currentNode.parent.id}-${currentNode.id}`, // ID cạnh duy nhất
        source: currentNode.parent.id,
        target: currentNode.id,
      });
    }

    // Nếu là nút lá, kiểm tra chi phí tối ưu
    if (currentNode.level === n) {
      if (currentNode.cost < optimalCost) {
        optimalCost = currentNode.cost;
        optimalNode = currentNode;
      }
      continue;
    }

    // Sinh các nút con
    for (let job = 0; job < n; job++) {
      // Kiểm tra công việc đã được phân công trong chuỗi tổ tiên
      let ancestor: Node | undefined = currentNode;
      const assignedJobs = new Set<number>();
      while (ancestor) {
        if (ancestor.jobNumber !== -1) {
          assignedJobs.add(ancestor.jobNumber);
        }
        ancestor = ancestor.parent;
      }

      // Nếu công việc chưa được gán
      if (!assignedJobs.has(job)) {
        const newCost = currentNode.cost + costMatrix[currentNode.level][job];

        // Cắt nhánh: nếu chi phí hiện tại >= chi phí tối ưu, bỏ qua
        if (newCost >= optimalCost) {
          continue;
        }

        const childNode: Node = {
          id: `${currentNode.level}-${job}-${uuidv4()}`,
          jobNumber: job,
          workerNumber: currentNode.level,
          parent: currentNode,
          cost: newCost,
          level: currentNode.level + 1,
        };
        minHeap.push(childNode); // Thêm nút con vào heap
      }
    }
  }

  // Hàm truy vết kết quả từ nút tối ưu
  function tracePath(
    optimalNode: Node | null
  ): { worker: number; job: number }[] {
    if (!optimalNode) return [];

    const path: { worker: number; job: number }[] = [];
    let currentNode: Node | null = optimalNode;

    while (currentNode?.parent) {
      path.unshift({
        worker: currentNode.workerNumber,
        job: currentNode.jobNumber,
      });
      currentNode = currentNode.parent;
    }

    return path;
  }

  // Tính vị trí các node bằng Dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return {
    nodes: layoutedNodes,
    edges,
    optimalCost,
    optimalNode,
    tracePath: () => tracePath(optimalNode),
  };
}
