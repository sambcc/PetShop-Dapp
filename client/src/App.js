import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import { useDispatch, useSelector } from 'react-redux';
import { adoptPet, UnAdoptPet, initWeb3, loadAdopters} from './store/adoptionSlice';
//import imgLoader from './loader.gif';
import { Error } from './components/Error';

function App() {
  const {web3,contract, account, pets,adopters,isLoading, adoptersLoading} = useSelector(state=>state.adoption);
  const dispatch = useDispatch();
  
  
  useEffect(() => {
    if(!isLoading)  
      dispatch(initWeb3());  
  }, []);

  const [reload, setReload] = useState([]);

  function usePrevious(value) {
    const ref = useRef([]);
    return ref.current;
  }
  const prevData = usePrevious(adopters);


  useEffect(() => {
    
    setInterval(() => {
      if(!isLoading && loadAdopters == false) 
        dispatch(loadAdopters({contract}))
        console.log(adopters)
        
       }, 2000);
    if (adopters !== prevData)
    return setReload(adopters)   

  }, [reload]);
  
  /* useEffect(() => {
  //if(isLoading)  
    setInterval(() => {
    const newData = dispatch(loadAdopters({contract})); 
    if (newData === oldData)
      return setReload(newData)
      //setReload(adopters)
    }, 2000); 

  }, [reload]);*/
 /* useEffect(() => {
  //if(isLoading)  
    setInterval(() => {
    const newData = dispatch(loadAdopters({contract})); 
    if (newData === oldData)
      return setReload(newData)
      //setReload(adopters)
    }, 2000); 

  }, [reload]);*/
  
  
  //Don't render if adopters not loaded
  if(!adopters) return '';

  
  const emptyAddress = "0x0000000000000000000000000000000000000000"; 
  //console.log("In App",pets);

  // <img alt="140x140" src={`${pet.picture}`} />
  return (
    <>
    <div className="header">
      Welcome To Your Community Pet Shop 
    </div>
    <Error />
    <div>
    {adoptersLoading==false && pets.map((pet,index)=>(
        <div className="card">
          <div className="container">
            <h4>{pet.name}</h4>
            <div><b>Breed:</b> {pet.breed}</div>
            <div>{pet.age} years old</div>
            <div>{pet.location}</div>
            
        </div>
          {adopters[index]===emptyAddress?
             //isLoading? <img className="loader" src={imgLoader} />:
              <button onClick={()=>{
               dispatch(adoptPet(index));
               console.log('rerender')
              }}>Adopt</button>:
            <div>
            <b className="adopted">Adopted</b>
            <button onClick={()=>{
                dispatch(UnAdoptPet(index));
              }}>UnAdopt</button>
          
            </div>
          }
        </div>
    )
    )}
    </div>
      
    </>
  );
}

export default App;
