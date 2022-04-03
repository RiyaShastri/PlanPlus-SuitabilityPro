IN_FILE=ui_source_ci.zip

echo "zipping the files..."

zip --quiet -r "$IN_FILE" . -x \*.class -x \s3*.jar

java -jar s3putObject-1.0.0.jar $1 $2 ${IN_FILE}
