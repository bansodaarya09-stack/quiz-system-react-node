import React,{useEffect,useState} from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { API_BASE } from '../api';

export default function Quiz(){
  const [questions,setQuestions]=useState([]); const [idx,setIdx]=useState(0);
  const [answers,setAnswers]=useState({}); const [timeLeft,setTimeLeft]=useState(20*60);
  useEffect(()=>{ fetchQuestions(); },[]);
  useEffect(()=>{ const t=setInterval(()=>setTimeLeft(s=>s-1),1000); if(timeLeft<=0) submit(); return ()=>clearInterval(t); },[timeLeft]);
  async function fetchQuestions(){ const token=localStorage.getItem('token'); try{ const res=await fetch(API_BASE + '/api/questions',{headers:{'Authorization':'Bearer '+token}}); const data=await res.json(); setQuestions(data);}catch(e){console.error(e); alert('Could not load questions');}}
  function chooseOption(i){ setAnswers(prev=>({...prev,[idx]:i})); }
  function submit(){ const token=localStorage.getItem('token'); const user=localStorage.getItem('user'); const payload={user,answersOnShuffled:Object.values(answers),shuffledOrder:questions.map(q=>q.id)}; fetch(API_BASE + '/api/submit',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(payload)}).then(r=>r.json()).then(d=>{ alert('Submitted. Score: ' + (d.score||'N/A')); window.location.href='/login'; }).catch(e=>{console.error(e); alert('Submit failed');}); }
  if(!questions.length) return <Typography>Loading questions...</Typography>;
  const q=questions[idx];
  return (<Box><Box sx={{display:'flex',justifyContent:'space-between',mb:2}}><Typography>Question {idx+1} / {questions.length}</Typography><Typography>{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</Typography></Box><LinearProgress variant="determinate" value={((questions.length?idx:0)/questions.length)*100} sx={{mb:2}} /><Typography variant="h6" sx={{mb:2}}>{q.q}</Typography><Box sx={{display:'grid',gap:1}}>{q.a.map((choice,i)=>(<Button key={i} variant={answers[idx]===i?'contained':'outlined'} onClick={()=>chooseOption(i)}>{choice}</Button>))}</Box><Box sx={{mt:3,display:'flex',gap:1}}><Button disabled={idx===0} onClick={()=>setIdx(i=>i-1)}>Prev</Button><Button disabled={idx===questions.length-1} onClick={()=>setIdx(i=>i+1)}>Next</Button><Button color="error" onClick={submit}>Submit</Button></Box></Box>);
}
