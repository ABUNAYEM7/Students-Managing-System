import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "./AxiosSecure"

const useFetchData = (key,endpoint) => {
  const {data,isLoading,isError,error,refetch} = useQuery({
    queryKey :[key],
    queryFn : async()=>{
        const res =await axiosInstance.get(endpoint)
        return res?.data
    }
  })
  return {data,isLoading,isError,error,refetch}
}

export default useFetchData
