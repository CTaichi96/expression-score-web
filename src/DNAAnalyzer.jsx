// src/DNAAnalyzer.jsx
import React, { useState } from "react";
import { Scatter, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

// GC-rich stretches detection (G/C runs)
function detectGCStretches(seq) {
  const stretches = [];
  let i = 0;
  while (i < seq.length) {
    if (seq[i]==="G"||seq[i]==="C") {
      const start=i;
      let s="";
      while(i<seq.length&&(seq[i]==="G"||seq[i]==="C")){
        s+=seq[i]; i++;
      }
      stretches.push({ start: start+1, end: i, length: i-start, sequence: s });
    } else i++;
  }
  return stretches;
}
// GC% sliding
function computeGCPercent(seq,win=30){
  const data=[];
  for(let i=0;i<=seq.length-win;i++){
    const w=seq.slice(i,i+win);
    const c=w.split('').filter(b=>b==='G'||b==='C').length;
    data.push({x:i+1,y:+(c/win).toFixed(3)});
  }
  return data;
}

export default function DNAAnalyzer() {
  const [seq,setSeq]=useState(""),[gcR,setGcR]=useState([]),[gcP,setGcP]=useState([]);

  const analyze=()=>{
    const clean=seq.toUpperCase().replace(/[^ACGT]/g,"");
    setGcR(detectGCStretches(clean));
    setGcP(computeGCPercent(clean));
  };

  const scatterOptions = {
    scales:{
      x:{ title:{display:true,text:"Position"} },
      y:{ title:{display:true,text:"Length (bp)"} }
    },
    plugins:{ tooltip:{ callbacks:{ label(ctx){
      const r=gcR[ctx.dataIndex];
      return `Start:${r.start},Len:${r.length},Seq:${r.sequence}`;
    }}}}
  };
  const lineOptions={
    scales:{
      x:{ title:{display:true,text:"Position"} },
      y:{ title:{display:true,text:"GC%"} }
    }
  };

  return (
    <div style={{padding:16,maxWidth:960,margin:"auto"}}>
      <h2>DNA GC Analysis</h2>
      <textarea
        rows={4}
        style={{width:"100%",marginBottom:8}}
        placeholder="Paste DNA seq"
        value={seq} onChange={e=>setSeq(e.target.value)}
      />
      <button onClick={analyze}>Analyze</button>

      {gcR.length>0&&(
        <>
          <h3>GC-rich Regions</h3>
          <Scatter data={{
            datasets:[{ label:"GC stretches", data:gcR.map(r=>({x:r.start,y:r.length})), backgroundColor:"#36a2eb"}]
          }} options={scatterOptions} />
          <h3>GC% (30bp)</h3>
          <Line data={{
            labels:gcP.map(p=>p.x),
            datasets:[{ label:"GC%",data:gcP.map(p=>p.y), fill:false, borderColor:"#4bc0c0",pointRadius:0 }]
          }} options={lineOptions} />
          <table style={{width:"100%",borderCollapse:"collapse",marginTop:16}}>
            <thead><tr><th>Start</th><th>End</th><th>Len</th><th>Seq</th></tr></thead>
            <tbody>
              {gcR.map((r,i)=><tr key={i}>
                <td>{r.start}</td><td>{r.end}</td><td>{r.length}</td><td style={{fontFamily:"monospace"}}>{r.sequence}</td>
              </tr>)}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
