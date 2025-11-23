import axios from "axios";

// Auto-detect local vs production environment
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on localhost, use local backend server
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000';
  }
  
  // Otherwise, use production Render URL
  return 'https://e-commerce-website-backend-wy5z.onrender.com';
};

const apiUrl = getApiUrl();
console.log('Admin API URL:', apiUrl);

export const postData = async (url, formData) => {
    try {
        
        const response = await fetch(apiUrl + url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },

            body: JSON.stringify(formData)
        });


        if (response.ok) {
            const data = await response.json();
            //console.log(data)
            return data;
        } else {
            const errorData = await response.json();
            return errorData;
        }

    } catch (error) {
        console.error('Error:', error);
    }

}



export const fetchDataFromApi = async (url) => {
    try {
        const params={
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
                'Content-Type': 'application/json', // Adjust the content type as needed
              },
        
        } 

        const { data } = await axios.get(apiUrl + url,params)
        return data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error.message);
        if (error.response) {
            return error.response.data;
        }
        return { error: true, message: error.message };
    }
}


export const uploadImage = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'multipart/form-data', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.put(apiUrl + url,updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}


export const uploadImages = async (url, formData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'multipart/form-data', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.post(apiUrl + url,formData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}



export const editData = async (url, updatedData ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 

    var response;
    await axios.put(apiUrl + url,updatedData, params).then((res)=>{
        response=res;
        
    })
    return response;
   
}





export const deleteImages = async (url,image ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(apiUrl + url, params);
    return res;
}


export const deleteData = async (url ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(apiUrl + url,params)
    return res;
}

export const deleteMultipleData = async (url,data ) => {
    const params={
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Include your API key in the Authorization header
            'Content-Type': 'application/json', // Adjust the content type as needed
          },
    
    } 
    const { res } = await axios.delete(apiUrl + url,data,params)
    return res;
}