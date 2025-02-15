import { useEffect, useState } from "react";
import * as UserService from "~/services/UserService";

const useGetDetailUserById = ({ reload = false, id }) => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        setLoading(true);
        const res = await UserService.getDetailUserByUserId(id);
        if (res?.code === 1000) {
            setUser(res?.result);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id, reload]);

    return { loading, user, reload: fetchUser };
};

export default useGetDetailUserById;
