# polarlionmt-django-demo

## Environment
CentOS Linux release 7.5.1804  
Apache/2.4.6 (CentOS)  
Python 3.6.5  
Django 2.1.4  

## Reuqirements  
yum install expat-devel  
pip install -v mod_wsgi-httpd  
pip install mod_wsgi  


## Usage
在 "/etc/httpd/conf/httpd.conf" 文件中加入下述内容
LoadModule wsgi_module /path/to/python3.6/site-packages/mod_wsgi/server/mod_wsgi-py36.cpython-36m-x86_64-linux-gnu.so
DocumentRoot /path/to/your-site/mysite/
WSGIScriptAlias /polarlionmt  /path/to/your-site/mysite/wsgi.py
WSGIPythonPath /path/to/your-site/
Alias /static/ /path/to/your-site/static/
<Directory /path/to/your-site/static>
Order deny,allow
Options Indexes FollowSymLinks
AllowOverride All
Require all granted
Allow from all
</Directory>
<Directory /path/to/your-site/mysite>
<Files wsgi.py>
Require all granted
</Files>
</Directory>
