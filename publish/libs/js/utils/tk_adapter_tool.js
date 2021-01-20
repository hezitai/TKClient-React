try{
    var myURL = window.URL || webkitURL;
    if(myURL){
        if(window && window.MediaStream){
            var mediaStream = new window.MediaStream();
            try{
                myURL.createObjectURL(mediaStream);
            }catch (e1) {
                window._URLCreateObjectURL = myURL.createObjectURL;
                window.HTMLMediaElement.prototype._setAttribute = window.HTMLMediaElement.prototype.setAttribute;
                window.HTMLMediaElement.prototype._removeAttribute = window.HTMLMediaElement.prototype.removeAttribute;
                myURL.createObjectURL = function(mediaStream){
                    try{
                        return window._URLCreateObjectURL(mediaStream);
                    }catch (e) {
                        if( mediaStream && window.MediaStream && mediaStream instanceof window.MediaStream){
                            return mediaStream;
                        }else{
                            console.error('redefine createObjectURL err:',e);
                            return mediaStream;
                        }
                    }
                }
                if (window.HTMLMediaElement && ('srcObject' in window.HTMLMediaElement.prototype)) {
                    Object.defineProperty(window.HTMLMediaElement.prototype, 'src', {
                        set: function(url) {
                            if (url && window.MediaStream && url instanceof window.MediaStream) {
                                this._srcObject = url;
                                this.srcObject = this._srcObject;
                            } else {
                                this.srcObject = null;
                                this._srcObject = undefined;
                                this._setAttribute('src',url);
                            }
                        }
                    });
                    window.HTMLMediaElement.prototype.setAttribute = function(key,value) {
                        if(key === 'src'){
                            this.src = value;
                        }else{
                            this._setAttribute(key,value);
                        }
                    }
                    window.HTMLMediaElement.prototype.removeAttribute = function(key) {
                        if(key === 'src'){
                            this.src = '';
                        }else{
                            this._removeAttribute(key);
                        }
                    }
                }
            }
        }
    }
}catch (err) {
   console.error('compatibility createObjectURL err:',err);
}
