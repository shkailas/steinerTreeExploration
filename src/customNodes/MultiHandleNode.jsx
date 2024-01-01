import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

const handleStyle = { left: 10 };

function MultiHandleNode({ data, isConnectable }) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Bottom} id="a" isConnectable={isConnectable} />
      <div>
        
        <p style={{fontSize: '10px', padding:'2px'}}>{data.label}</p>
        
        
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        isConnectable={isConnectable}
      />
      

    </div>
  );
}

export default MultiHandleNode;
