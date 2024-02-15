import { OwlClient, AuthInitResponse, DeserializationError } from "owl-ts";

const cfg = {
    p: "0xfd7f53811d75122952df4a9c2eece4e7f611b7523cef4400c31e3f80b6512669455d402251fb593d8d58fabfc5f5ba30f6cb9b556cd7813b801d346ff26660b76b9950a5a49f9fe8047b1022c24fbba9d7feb7c61bf83b57e7c6a8a6150f04fb83f6d3c51ec3023554135a169132f675f3ae2b61d72aeff22203199dd14801c7",
    q: "0x9760508f15230bccb292b982a2eb840bf0581cf5",
    g: "0xf7e1a085d69b3ddecbbcab5c36b857b97994afbbfa3aea82f9574c0b3d0782675159578ebad4594fe67107108180b449167123e84c281613b7cf09328cc8a6e13c167a8b547c8d28e0a3ae1e2bb3a675916ea37f0bfa213562f1fb627a01243bcca4f1bea8519089a883dfe15ae59f06928b665e807b552564014c3bfecf492a",
    serverId: "localhost"
}

document.querySelector("form")!.addEventListener("submit", async function(event: Event){
    event.preventDefault();
    try{
    const form = new FormData(event.target as HTMLFormElement);
    const username = form.get("username")!.toString().trim();
    const password = form.get("password")!.toString().trim();
    
    const client = new OwlClient(cfg);
    const initRequest = await client.authInit(username, password);
    let response = await fetch("/login/login-init", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            init: initRequest.serialize()
        })
    });
    if(response.status != 200){
        throw new Error(await response.text());
    }
    let result = await response.json();

    const initResponse = AuthInitResponse.deserialize(result);
    if(initResponse instanceof DeserializationError){
        throw initResponse;
    }

    const finish = await client.authFinish(initResponse);
    if(finish instanceof Error){
        throw finish;
    }
    const {key, finishRequest} = finish;

    response = await fetch("/login/login-finish", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            finish: finishRequest.serialize()
        })
    });

    if(response.status == 200){
        console.log("Login success");
    } else{
        console.error(`Login failure: ${await response.text()}`);
    }

    } catch(error: any){
        console.error(error.message);
    }
    // prevent form submission
    return false;
});