# first need to change paths at gsbpaths.py, then run "sh getdata.sh $1", where $1 is the entity you want to download
python gsbpaths.py download datastore / cb-energietransitie cb-energietransitie.appspot.com --archive_path ./$1.zip --datastore_types $1
