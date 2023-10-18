import { Handle, Position } from "reactflow";
import { MappingNodeData } from "./App";

function CustomNode({ data }: { data: MappingNodeData }) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-red-600">{data.title}</span>

        {data.fields &&
          Object.keys(data.fields).map((field) => (
            <span key={field} className="text-xs text-gray-600">
              {field}: {data.fields![field]}
            </span>
          ))}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="w-1 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-1 !bg-teal-500"
      />
    </div>
  );
}

export default CustomNode;
