import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { ArrowRight, File, Trash2, Upload } from 'lucide-react';
import { Algo, Matrix } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

function validateMatrix(content: string): Matrix {
  const rows = content.trim().split('\n');
  const parsedMatrix: number[][] = rows.map((row) =>
    row
      .trim()
      .split(/\s+/)
      .filter((val) => !isNaN(Number(val)))
      .map(Number)
  );

  const isSquare = parsedMatrix.every(
    (row) => row.length === parsedMatrix.length
  );
  const allPositive = parsedMatrix.flat().every((num) => num > 0);

  if (!isSquare)
    throw new Error('Số hàng và số cột của ma trận không bằng nhau.');
  if (!allPositive) throw new Error('Ma trận chứa số âm hoặc không hợp lệ.');

  return parsedMatrix;
}

interface Props {
  setMatrix: Dispatch<SetStateAction<Matrix>>;
  setAlgo: Dispatch<SetStateAction<Algo>>;
  algo: Algo;
  matrix: Matrix;
  onRun: () => void;
}

export const MatrixDropzone: FC<Props> = ({
  setMatrix,
  setAlgo,
  algo,
  matrix,
  onRun,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const onDrop = (acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          const matrix = validateMatrix(content);
          setFile(file);
          setMatrix(matrix);
        } catch (e) {
          setError(`${file.name}: ${(e as Error).message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setMatrix([]);
  };

  return (
    <div className="space-y-4 text-white">
      <div
        {...getRootProps({
          className: cn(
            'p-6 cursor-pointer hover:bg-gray-800 rounded-lg border-dashed border-2 border-gray-500',
            matrix.length > 0 && 'hidden'
          ),
        })}
      >
        <input {...getInputProps()} />
        <div className="text-white flex flex-col items-center">
          <div className="rounded-full border border-gray-700 mb-3 p-2">
            <Upload />
          </div>
          <p className="text-sm">
            Drag and drop a file here, or click to select a file
          </p>
          <p className="text-xs text-gray-500">
            You can upload a single file (up to 100 MB)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          {error}
        </Alert>
      )}

      {file && (
        <div className="space-y-2">
          <h2 className="text-xs text-gray-200 font-bold">Uploaded file</h2>
          <div className="flex justify-between py-2">
            <div className="flex gap-2 text-xs text-white items-center">
              <File size="35px" />
              <div className="flex flex-col justify-between">
                <p>{file.name}</p>
                <p className="text-[12px]">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                defaultValue={algo}
                onValueChange={(value: Algo) => setAlgo(value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Algo.Greedy}>Greedy</SelectItem>
                  <SelectItem value={Algo.BruteForce}>Brute Force</SelectItem>
                  <SelectItem value={Algo.BranchBound}>
                    Branch and Bound
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select />
              <Button
                className="p-2 border border-gray-700 text-red-500 h-auto"
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <Trash2 />
              </Button>
              <Button
                className="p-2 border border-gray-700 h-auto"
                variant="ghost"
                size="sm"
                onClick={onRun}
              >
                Run <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
