import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { isValidElement } from 'react';
import Web3 from "web3";
import AdoptionArtifact from '../contracts/Adoption.json';
import pets from '../pets.json';

const NETWORK_GANACHE = '5777';
const NETWORK_ROPSTEN = '3';

//Action to connect with Web3 and Contract and adopters
export const initWeb3 = createAsyncThunk(
  'initWeb3',
  async (a, thunkApi) =>{
    console.log("Web3.givenProvider = ",Web3.givenProvider);
    //getting web3 
    const web3 = new Web3(Web3.givenProvider);
    //connecting MetaMask wallet address
    await web3.givenProvider.enable();
    
    
    //1. getting deployed contract local Ganache
    //let network = AdoptionArtifact.networks[NETWORK_GANACHE];
    //getting deployed contract on Ropsten
    let network = AdoptionArtifact.networks[NETWORK_ROPSTEN]

    if(!network){
      console.log("Init Web3: Setting up Ropsten network");
    }else if(!network){
      //Throwing error
      return thunkApi.rejectWithValue('No contract deployed, Deploy contract on Ganache or Ropsten'); 
    }
    
    const contract_address = network.address;
    console.log(contract_address)
    
    const contract = new web3.eth.Contract(
                      AdoptionArtifact.abi, //ABI
                      contract_address
                      ); //Contract Address
    
    console.log("Thunk contract",contract);
    
    //getting adopters data to Mark pet as Adopted
    //const adopters = await contract.methods.getAdopters().call();
    //console.log("Thunk adopters",adopters);
    
    //getting current eth account
    const accounts = await web3.eth.getAccounts();
    console.log("Thunk account ",accounts);

    //load adopters list
    const adopters = thunkApi.dispatch(loadAdopters({contract}));
    
    return {web3,contract,adopters, accounts}; //,adopters
  }
);

// Action to loadAdopters
export const loadAdopters = createAsyncThunk(
  "LoadAdopters",
  async(data, thunkApi)=>{
      
      const adopterList = await data.contract.methods.getAdopters().call();
      return adopterList;
  }
)

//Action to create adopt by address
export const adoptPet = createAsyncThunk(
  'adoptPet',
  async (petId,thunkApi)=>{
    console.log("Async Adopt Pet PetID",petId);
    const state = thunkApi.getState().adoption;
    const contract = state.contract;
    const accounts = state.account;
    console.log("In adoptPet",accounts);
    //calling contract method and doing transaction
    let result={};
    //try{
      result = await contract.methods.adopt(petId).send({from: accounts[0]});
      console.log("Async Adopt Pet result:",result);
    //}catch(error){
    //  console.log("Async Adopt Pet error:",error);
    //  return thunkApi.rejectWithValue(error.message); 
    //} 
    //refreshing the adopters
    const adopters = await contract.methods.getAdopters().call();
    return {result,adopters};
  }
);
//Action to create Unadopt by address
export const UnAdoptPet = createAsyncThunk(
  'UnAdoptPet',
  async (petId,thunkApi)=>{
    console.log("Async UnAdopt Pet PetID",petId);
    const state = thunkApi.getState().adoption;
    const contract = state.contract;
    const accounts = state.account;
    console.log("In UnAdoptPet",accounts);
    //calling contract method and doing transaction
    let result={};
    try{
      result = await contract.methods.UnAdopt(petId).send({from: accounts[0]});
      console.log("Async UnAdopt Pet result:",result);
    }catch(error){
      console.log ("Async Adopt Pet error:",error);
      return thunkApi.rejectWithValue(error.message);
      
     
    }   
    //refreshing the adopters
    const adopters = await contract.methods.getAdopters().call();
    return {result,adopters};
  }
);
export const adoptionSlice = createSlice({
  name: 'adoptionSlice',
  initialState: {
    web3: null,
    contract: null,
    account: null,
    adopters: [],
    pets: pets,
    error: null,
    isLoading: false,
    adoptersLoading: null
  },
  reducers: {
  },
  extraReducers: {
    [initWeb3.fulfilled]: (state,action) =>{
      //add web3 instance to the state array
      const {web3,contract,adopters,accounts} = action.payload;
      console.log("In fullfilled WEB3",Web3);
      console.log("In fullfilled Contract",contract);
      console.log("In fullfilled Adopters",adopters);
      console.log("In fullfilled Account",accounts);
      state.web3 = web3;
      state.contract = contract;
      //state.adopters = adopters;
      state.account = accounts;
      state.isLoading = false;
    },
    [initWeb3.rejected]: (state,action) =>{
      state.error = action.error.message;
      state.isLoading=false;
      console.log("initWeb3.rejected ERROR",action);
    },
    [initWeb3.pending]: (state,action) =>{
      state.isLoading=true;
      console.log("initWeb3.pending",action);
    },
    [loadAdopters.fulfilled]: (state,action)=>{
      state.adopters = action.payload
      state.adoptersLoading=false
    },
    [loadAdopters.rejected]: (state,action) =>{
      //state.error = action.error.message;
      //console.log("loadAdopters.rejected ERROR",action);
      state.adoptersLoading=false;
    },
    [loadAdopters.pending]: (state,action) =>{
      state.adoptersLoading=true;
      //console.log("loadAdopters.pending",action);
    },
    [adoptPet.fulfilled]: (state,action) =>{
      const {transaction,adopters} = action.payload;
      state.adopters = adopters;
      state.isLoading=false;
    },
    [adoptPet.rejected]: (state,action) =>{
      state.error = action.error.message;
      console.log("adoptPet.rejected ERROR",action);
      state.isLoading=false;
    },
    [adoptPet.pending]: (state,action) =>{
      state.isLoading=true;
      console.log("adoptPet.pending",action);
    },
    [UnAdoptPet.fulfilled]: (state,action) =>{
      const {transaction,adopters} = action.payload;
      state.adopters = adopters;
      state.isLoading=false;
    },
    [UnAdoptPet.rejected]: (state,action) =>{
      state.error = action.error.message;
      console.log("UnAdoptPet.rejected ERROR",action);
      state.isLoading=false;
    },
    [UnAdoptPet.pending]: (state,action) =>{
      state.isLoading=true;
      console.log("UnAdoptPet.pending",action);
    },
  },
});

export default adoptionSlice.reducer;